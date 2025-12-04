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
# Static feature ranges
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
# Clean model loader
# ------------------------------------------------------------
def load_all():
    """Load model, encoder, scaler safely in CPU environment."""
    
    if _loaded["model"] is None:
        _loaded["model"] = joblib.load(MODEL_PATH)

    if _loaded["le"] is None:
        _loaded["le"] = joblib.load(LE_PATH)

    if _loaded["sc"] is None:
        _loaded["sc"] = joblib.load(SC_PATH)

    if _loaded["features"] is None:
        sc = _loaded["sc"]
        if hasattr(sc, "feature_names_in_"):
            _loaded["features"] = list(sc.feature_names_in_)
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
# Categorize EUI
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
# Recommendations Logic
# ------------------------------------------------------------
def get_recommendations(vals):
    issues, recs = [], []

    for feat, (min_v, max_v) in FEATURE_RANGES.items():
        v = vals.get(feat)
        if v is None:
            continue

        try:
            v = float(v)
        except:
            continue

        if feat in ["Floor_Insulation", "Door_Insulation", "Roof_Insulation",
                    "Window_Insulation", "Wall_Insulation"] and v > max_v * 0.7:
            issues.append(f"{feat} is high (poor insulation).")
            recs.append("Improve insulation (lower U-values).")

        if feat == "Hvac_Efficiency" and v < 2:
            issues.append("Low HVAC efficiency.")
            recs.append("Upgrade to higher COP system.")

        if feat == "Domestic_Hot_Water_Usage" and v > 2.5:
            issues.append("High hot water usage.")
            recs.append("Use low-flow fixtures or efficient heaters.")

        if feat in ["Lighting_Density", "Equipment_Density"] and v > (max_v * 0.75):
            issues.append(f"{feat} is relatively high.")
            recs.append("Use more efficient equipment.")

        if feat == "Window_To_Wall_Ratio" and v > 50:
            issues.append("High window-to-wall ratio.")
            recs.append("Use shading or better glazing.")

    return issues, recs

# ------------------------------------------------------------
# Endpoints
# ------------------------------------------------------------
@api_view(["GET"])
def get_building_types(request):
    try:
        _, le, _, _ = load_all()
        classes = [c.title() for c in le.classes_]
        return Response({"building_types": classes})
    except Exception as e:
        return Response({"building_types": [], "error": str(e)}, status=500)

@api_view(["GET"])
def get_defaults(request):
    try:
        _, _, _, features = load_all()
    except:
        features = list(FEATURE_RANGES.keys())

    defaults = {f: FEATURE_RANGES[f][0] for f in features if f in FEATURE_RANGES}
    return Response({
        "features": features,
        "feature_ranges": FEATURE_RANGES,
        "defaults": defaults,
    })

@api_view(["POST"])
def predict_energy(request):
    try:
        model, le, sc, features = load_all()
    except Exception as e:
        return Response({"error": "Model load failed: " + str(e)}, status=500)

    try:
        data = request.data
        row = []

        for feat in features:
            if feat == "Building_Type":
                val = data.get("Building_Type") or ""
                try:
                    encoded = int(le.transform([val.lower()])[0])
                except:
                    return Response({"error": f"Unknown Building_Type: {val}"}, status=400)
                row.append(encoded)
            else:
                if feat not in data:
                    return Response({"error": f"Missing feature: {feat}"}, status=400)
                row.append(float(data[feat]))

        df = pd.DataFrame([row], columns=features)
        scaled = sc.transform(df)

        yearly = float(model.predict(scaled)[0])
        monthly = yearly / 12
        area = float(data.get("Total_Building_Area", 0))
        eui = monthly / area if area > 0 else None

        issues, recs = get_recommendations(df.iloc[0].to_dict())

        return Response({
            "total_energy_month_kwh": round(monthly, 2),
            "eui_month_kwh_m2": round(eui, 2) if eui else None,
            "performance_category": monthly_category(eui),
            "impacting_factors": issues,
            "recommendations": recs,
        })

    except Exception as e:
        return Response({"error": str(e), "trace": traceback.format_exc()}, status=500)
