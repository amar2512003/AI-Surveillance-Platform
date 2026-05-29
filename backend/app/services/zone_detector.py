ZONE_X1 = 100
ZONE_Y1 = 100

ZONE_X2 = 500
ZONE_Y2 = 400


def point_in_zone(x, y):

    return (
        ZONE_X1 <= x <= ZONE_X2
        and
        ZONE_Y1 <= y <= ZONE_Y2
    )