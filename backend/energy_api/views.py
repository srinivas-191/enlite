# energy_api/views.py
import os
import traceback
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
import joblib
import pandas as pd

# ------------------------------------------------------------
# Model file paths
# ------------------------------------------------------------
MODEL_DIR = os.path.join(settings.BASE_DIR, "energy_api", "models")
MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
LE_PATH = os.path.join(MODEL_DIR, "model1.pkl")
SC_PATH = os.path.join(MODEL_DIR, "model2.pkl")

_loaded = {"model": None, "le": None, "sc": None, "features": None}

# ------------------------------------------------------------
# Static feature ranges used for recommendations
# ------------------------------------------------------------
FEATURE_RANGES = {
    "Floor_Insulation": (0.15, 1.60),
    "Door_Insulation": (0.81, 5.70),
    "Roof_Insulation": (0.07, 2.28),
    "Window_Insulation": (0.73, 5.75),
    "Wall_Insulation": (0.10, 2.40),
    "Hvac_Efficiency": (0.30, 4.50),
    "Domestic_Hot_Water_Usage": (0.50, 3.50),
    "Lighting_Density": (1, 9),
    "Occupancy_Level": (1, 6),
    "Equipment_Density": (1, 21),
    "Window_To_Wall_Ratio": (0, 70),
    "Total_Building_Area": (85.91, 10000),
}

# ------------------------------------------------------------
# Lazy load everything safely
# ------------------------------------------------------------
def load_all():
    if _loaded["model"] is None:
        _loaded["model"] = joblib.load(MODEL_PATH)

    if _loaded["le"] is None:
        _loaded["le"] = joblib.load(LE_PATH)

    if _loaded["sc"] is None:
        _loaded["sc"] = joblib.load(SC_PATH)

    if _loaded["features"] is None:
        sc = _loaded["sc"]

        # Modern sklearn objects store input order here:
        if hasattr(sc, "feature_names_in_"):
            _loaded["features"] = list(sc.feature_names_in_)

        # Manual fallback (your training column order)
        else:
            _loaded["features"] = [
                "Building_Type",
                "Floor_Insulation",
                "Door_Insulation",
                "Roof_Insulation",
                "Window_Insulation",
                "Wall_Insulation",
                "Hvac_Efficiency",
                "Domestic_Hot_Water_Usage",
                "Lighting_Density",
                "Occupancy_Level",
                "Equipment_Density",
                "Window_To_Wall_Ratio",
                "Total_Building_Area",
            ]

    return (
        _loaded["model"],
        _loaded["le"],
        _loaded["sc"],
        _loaded["features"],
    )

# ------------------------------------------------------------
# EUI Categorization Logic
# ------------------------------------------------------------
def monthly_category(eui):
    if eui is None:
        return "Unknown"
    if eui <= 12.50:
        return "Very Efficient"
    if eui <= 20.83:
        return "Average Efficiency"
    if eui <= 29.17:
        return "Moderately High"
    if eui <= 41.67:
        return "High Energy Consumption"
    return "Very Poor (Inefficient)"

# ------------------------------------------------------------
# Generate Issues + Recommendations
# ------------------------------------------------------------
def get_recommendations(vals):
    issues, recs = [], []

    for feat, (min_v, max_v) in FEATURE_RANGES.items():
        val = vals.get(feat)
        if val is None:
            continue

        try:
            v = float(val)
        except:
            continue

        # Insulation → lower = better
        if feat in ["Floor_Insulation", "Door_Insulation", "Roof_Insulation",
                    "Window_Insulation", "Wall_Insulation"]:
            if v > max_v * 0.7:
                issues.append(f"{feat} is high (poor insulation).")
                recs.append("Improve insulation (aim for lower U-values).")

        # HVAC
        if feat == "Hvac_Efficiency" and v < 2:
            issues.append("HVAC efficiency is low.")
            recs.append("Upgrade HVAC system (COP > 3 recommended).")

        # Water
        if feat == "Domestic_Hot_Water_Usage" and v > 2.5:
            issues.append("Domestic hot water usage is high.")
            recs.append("Install low-flow fixtures & efficient heaters.")

        # Lighting + Equipment
        if feat in ["Lighting_Density", "Equipment_Density"] and v > (max_v * 0.75):
            issues.append(f"{feat} is high.")
            recs.append("Use LED lighting & efficient appliances.")

        # Occupancy
        if feat == "Occupancy_Level" and v > 4:
            issues.append("Occupancy level is high.")
            recs.append("Optimize occupancy scheduling.")

        # WWR
        if feat == "Window_To_Wall_Ratio" and v > 50:
            issues.append("High window-to-wall ratio.")
            recs.append("Use shading or improved glazing.")

    return issues, recs

# ------------------------------------------------------------
# API: Get building types (label classes)
# ------------------------------------------------------------
@api_view(["GET"])
def get_building_types(request):
    try:
        _, le, _, _ = load_all()
        classes = list(map(str, getattr(le, "classes_", [])))

        return Response({"building_types": classes})

    except FileNotFoundError:
        return Response({
            "building_types": [],
            "error": "Model files not found on server."
        }, status=500)

    except Exception as e:
        return Response({
            "building_types": [],
            "error": str(e)
        }, status=500)

# ------------------------------------------------------------
# API: Default ranges + initial values
# ------------------------------------------------------------
@api_view(["GET"])
def get_defaults(request):
    try:
        _, _, _, features = load_all()
    except:
        features = list(FEATURE_RANGES.keys())

    defaults = {
        f: (FEATURE_RANGES[f][0] if f in FEATURE_RANGES else "")
        for f in features
    }

    return Response({
        "features": features,
        "feature_ranges": FEATURE_RANGES,
        "defaults": defaults,
    })

# ------------------------------------------------------------
# API: Prediction
# ------------------------------------------------------------
@api_view(["POST"])
def predict_energy(request):
    try:
        model, le, sc, features = load_all()

    except FileNotFoundError:
        return Response({"error": "Model/scaler/encoder missing."}, status=500)

    except Exception as e:
        return Response({"error": str(e)}, status=500)

    try:
        data = request.data or {}
        row = []

        for feat in features:
            # Building Type → encoded
            if feat == "Building_Type":
                b = data.get("Building_Type") or data.get("building_type")
                if not b:
                    return Response({"error": "Building_Type is required."}, status=400)

                try:
                    encoded = int(le.transform([b.lower()])[0])
                except:
                    try:
                        encoded = int(le.transform([b])[0])
                    except:
                        return Response({"error": f"Unknown Building_Type: {b}"}, status=400)

                row.append(encoded)
                continue

            # Other features → float
            if feat not in data:
                return Response({"error": f"Missing feature: {feat}"}, status=400)

            try:
                row.append(float(data[feat]))
            except:
                return Response({"error": f"Invalid numeric value for {feat}: {data[feat]}"}, status=400)

        X = pd.DataFrame([row], columns=features)
        scaled = sc.transform(X)

        yearly = float(model.predict(scaled)[0])
        monthly = yearly / 12

        area = float(data.get("Total_Building_Area", 0))
        eui = monthly / area if area > 0 else None

        issues, recs = get_recommendations(X.iloc[0].to_dict())

        return Response({
            "total_energy_month_kwh": round(monthly, 2),
            "eui_month_kwh_m2": round(eui, 2) if eui else None,
            "performance_category": monthly_category(eui),
            "impacting_factors": issues,
            "recommendations": recs,
        })

    except Exception as e:
        return Response({
            "error": str(e),
            "trace": traceback.format_exc(),
        }, status=500)
