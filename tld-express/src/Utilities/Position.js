import { Cabinet } from "../Entities/Cabinet";
import { CONVERSION } from "../Components/Core/CatalogItem";

export const ADJACENCY_THRESHHOLD = 1;
export const CABINET_GAP = 0.0025

/**
 * this will be the parent method that will handle calling the other methods handling the snapping of cabinets and the collision of cabinets
 * @param {Cabinet} newCab the cabinet that is being moved or created
 * @param {[Cabinet]} entityList the list of cabinets in the room
 * @returns 
 */
export function checkCollisionOrSnap(newCab, entityList) {

    let wallcabs = getCabinetsOnWall(entityList, newCab.wall.wallNumber);

    let adjCabs = findAdjacent(newCab, wallcabs, ADJACENCY_THRESHHOLD);
    if (adjCabs.length) {
        let closest = findClosest(newCab, adjCabs);
        snapTo(newCab, closest);
        
    }
    
    triggerCollisionCheck(entityList);
    return;
}

/**
 * this method will go through the entity list, and select all of the cabinets on the same wall as the cabinet and therefor valid for snapping.
 * @param {[Cabinet]} entityList a list of all the cabinets in the room
 * @param {number} wallNumber the number of the wall that the cabinet is related to
 * @returns a list of cabinets on the specified wall
 */
export function getCabinetsOnWall(entityList, wallNumber) {
    return entityList.filter(((item) => item.wall.wallNumber === wallNumber));
}


function getDistance(cabA, cabB) {

    const cabBWidth = cabB.measure.width;
    const cabAWidth = cabA.measure.width;

    const distanceBetweenCenter = (cabB.distanceAlongWall - cabA.distanceAlongWall)
    // console.log("Distance between centers = " + distanceBetweenCenter);
    let distanceBetweenEdge;
    const sign = distanceBetweenCenter / Math.abs(distanceBetweenCenter);
    distanceBetweenEdge = sign * Math.abs(distanceBetweenCenter * -sign + (cabAWidth / 2 + cabBWidth / 2))
    // console.log("Distance between " + cabA.id + " and " + cabB.id + " is: " + distanceBetweenEdge)
    return distanceBetweenEdge;

}

/**
 * this method will go through cabinets on the same wall as the changed cabinet, and see if there are any within range to snap
 * @param {Cabinet} newCab the cabinet that is being moved or created
 * @param {[Cabinet]} wallCabList all of the other cabinets on that wall.
 * @returns an array of cabinets that are within range to snap to. May return 0 if there are none in range.
 */
export function findAdjacent(newCab, wallCabList, threshhold = ADJACENCY_THRESHHOLD) {
    let adjacentList = [];

    wallCabList.forEach((cab) => {
        if (cab.measure) { // 
            if (cab.isUpper == newCab.isUpper && cab.id != newCab.id) {
                if (Math.abs(getDistance(cab, newCab)) <= threshhold) {
                    adjacentList.push(cab);
                }
            }
        }
    });

    return adjacentList;
}

/**
 * will take in an array of snappable cabinets, and return the cabinet that would require the least movement to snap to
 * @param {Cabinet} newCab the cabinet that is being moved or created
 * @param {[Cabinet]} snapList a list of more than 1 cabinet that will be compared for distance.
 * @returns the cabinet that will be snapped to.
 */
export function findClosest(newCab, snapList) {
    if (!snapList.length) throw new Error("snapList is empty")

    let lowestCab;
    let lowestDistance = ADJACENCY_THRESHHOLD + 1;
    snapList.forEach((cab) => {
        let newDistance = Math.abs(getDistance(cab, newCab))
        if (newDistance < lowestDistance) {
            lowestCab = cab;
            lowestDistance = newDistance;
        }
    })
    return lowestCab;
}

/**
 * This will take in a cabinet that is being altered, and a target cabinet that is being snapped to, and change the altered cabinet so that it is placed directly adjacent to the target cabinet.
 * @param {Cabinet} newCab the cabinet that is being moved or created
 * @param {Cabinet} oldCab the cabinet that is being snapped to
 * @param {function } adjustPositionMethod used for test mocking purposes, defaults to the correct function adjustPositionAlongWall
 */
export function snapTo(newCab, oldCab, adjustPositionMethod = adjustPositionAlongWall) {

    const distance = getDistance(oldCab, newCab)
    const sign = distance / Math.abs(distance);
    const newPositionAlongWall = oldCab.distanceAlongWall + (sign * (newCab.measure.width / 2 + oldCab.measure.width / 2 + CABINET_GAP));
    let Success = adjustPositionMethod(newCab, newPositionAlongWall);
    newCab.collideChecked = false;
    oldCab.collideChecked = false;
    return Success;
}

/**
 * This method will take in a cabinet, and the new position for that cabinet on its parent wall.
 * It will then modify the cabinets position so that it is correctly positioned 
 * in the world to be attached to that wall and at that position along the wall from the wall's origin.
 * @param {Cabinet} cab the cabinet that is being moved or created
 * @param {Number} newDistanceAlongWall the new position that the cabinet will be located at.
 */
export function adjustPositionAlongWall(cab, newDistanceAlongWall) {
    let width = (cab.measure.width);
    let wallMinimum = (0 + width / 2);
    let wallMaximum = (cab.wall.wallLength * CONVERSION - width / 2)
    
    if (newDistanceAlongWall >= wallMinimum && newDistanceAlongWall <= wallMaximum) {

        cab.distanceAlongWall = newDistanceAlongWall
        let b = cab.distanceAlongWall * Math.sin(cab.wall.wallRotation);
        let c = cab.distanceAlongWall * Math.cos(cab.wall.wallRotation);

        cab.posx = (cab.wall.posX * CONVERSION + c)
        cab.posz = (cab.wall.posZ * CONVERSION - b);

        return true;
    }
    return false;
}

export function KeepCabinetInsideWall(cabinet) {
    let wallEndPoint = [cabinet.wall.posX * CONVERSION + (cabinet.wall.wallLength * CONVERSION * (Math.sin(cabinet.wall.wallRotation + (Math.PI / 2.0)))), cabinet.wall.posZ * CONVERSION + (cabinet.wall.wallLength * CONVERSION * (Math.cos(cabinet.wall.wallRotation + (Math.PI / 2.0))))]
    let wallStartPoint = [cabinet.wall.posX * CONVERSION, cabinet.wall.posZ * CONVERSION]

    const wallLength = cabinet.wall.wallLength * CONVERSION;

    let [x, y] = [0, 1]

    let distanceFromWallStart = Math.sqrt((cabinet.posx - wallStartPoint[x]) ** 2 + (cabinet.posz - wallStartPoint[y]) ** 2)
    let distanceFromWallEnd = Math.sqrt((cabinet.posx - wallEndPoint[x]) ** 2 + (cabinet.posz - wallEndPoint[y]) ** 2)

    let maxPos = wallLength - cabinet.cabWidth / 12;
    let minPos = cabinet.cabWidth / 12;

    cabinet.distanceAlongWall = distanceFromWallStart

    let targetPosition
    if (distanceFromWallEnd > distanceFromWallStart && distanceFromWallEnd > wallLength) {
        targetPosition = minPos;
    }
    else if (distanceFromWallStart > distanceFromWallEnd && distanceFromWallStart > wallLength) {
       targetPosition = maxPos
    }

    if (targetPosition) {
        //ChangeTHEdistance to be farther along the wall.
        adjustPositionAlongWall(cabinet, targetPosition)
    }
}

export function triggerCollisionCheck(entityList){
    console.log(entityList)
    
    for (let cab of entityList) {
        cab.collideChecked = false
    }
    
}