def score_event(event_type, duration=0):

    score = 0.0

    if event_type == "person_detected":
        score += 0.1

    elif event_type == "person_exited":
        score += 0.0

    elif event_type == "loitering_warning":
        score += 0.6
    
    elif event_type == "zone_intrusion":
        score += 0.7

    if duration > 30:
        score += 0.2

    if duration > 60:
        score += 0.2

    score = min(score, 1.0)

    if score >= 0.8:
        severity = "L3"
    elif score >= 0.5:
        severity = "L2"
    else:
        severity = "L1"

    return score, severity