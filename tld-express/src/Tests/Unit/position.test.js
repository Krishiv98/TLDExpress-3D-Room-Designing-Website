import { describe, beforeEach, expect, it } from '@jest/globals';
import { cloneDeep } from 'lodash';
import { findClosest, findAdjacent, getCabinetsOnWall, adjustPositionAlongWall } from '../../Utilities/Position'
import * as Positions from '../../Utilities/Position'
import { mockedCabinetList } from '../mocks';
import { CONVERSION } from '../../Components/Core/CatalogItem';

describe("getCabinetsOnSameWall", () => {
  let cabinetList = [];
  let cab;
  let cabinetOffWall;
  beforeEach(() => {
    cabinetList = cloneDeep(mockedCabinetList)
    cabinetList.forEach(cab => {
      cab.wall.wallNumber = 1
    });


    cab = cabinetList[0];
    cabinetOffWall = cabinetList[1]
    cabinetOffWall.wall.wallNumber = 0
  })

  it("should return all cabinets on the same wall", () => {
    let cabinetsOnWall = cabinetList.filter(fcab => fcab.wall.wallNumber == cab.wall.wallNumber)
    expect(getCabinetsOnWall(cabinetList, 1)).toEqual(cabinetsOnWall)
  });

  it("should return no cabinets that are on other walls", () => {
    let wallNum = cab.wall.wallNumber;

    let res = getCabinetsOnWall(cabinetList, wallNum)
    for (const cabinet of res) {
      expect(cabinet.wall.wallNumber === wallNum).toBeTruthy();
    }
  });

});

describe("findAdjacent", () => {
  let cab;
  let closeCab;
  let wallCabList;

  beforeEach(() => {
    wallCabList = cloneDeep(mockedCabinetList);
    cab = cloneDeep(wallCabList[0]);
    closeCab = wallCabList[1];
    for (const cabinet of wallCabList) {
      cabinet.tempBoundBox = {
        "isBox3": true,
        "min": {
          "x": 13.25,
          "y": 0,
          "z": 13.25
        },
        "max": {
          "x": 16.75,
          "y": 3.5,
          "z": 16.75
        }
      }
      cabinet.measure = {width: 3.5};
      cabinet.distanceAlongWall = 15;
    };
    closeCab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 4.25,
        "y": 0,
        "z": 4.25
      },
      "max": {
        "x": 7.75,
        "y": 3.5,
        "z": 7.75
      }
    };
    closeCab.measure = {width: 3.5};
    closeCab.distanceAlongWall = 6;

    cab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "max": {
        "x": 3.5,
        "y": 3.5,
        "z": 3.5
      }
    };

    cab.measure = {width: 3.5};
    cab.distanceAlongWall = 1.75;

  })

  it("should return all cabinets within the threshold", () => {

    const resList = findAdjacent(cab, wallCabList)
    expect(resList).toContain(closeCab)

  });

  it("will not return cabinets outside of the threshold", () => {
    const resList = findAdjacent(cab, wallCabList)
    let otherCab = wallCabList[2]
    expect(resList).not.toContain(otherCab)
  });

  it("should return cabinets when they are within the threshold and negative", () => {
    closeCab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": -4,
        "y": 0,
        "z": -4
      },
      "max": {
        "x": -0.5,
        "y": 3.5,
        "z": -0.5
      }
    }

    cab.measure.width = 3.5;
    cab.distanceAlongWall = 10;
    
    let resList = findAdjacent(cab, wallCabList)
    expect(resList).toContain(closeCab)
  });

  it("should return cabinets when they are within the threshold and overlapping ", () => {
    closeCab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "max": {
        "x": 0.5,
        "y": 1,
        "z": 1
      }
      
    }

    
    closeCab.measure.width = 3.5;
    closeCab.distanceAlongWall = 5;

    const resList = findAdjacent(cab, wallCabList)
    expect(resList).toContain(closeCab)
  });

  it("should not return upper cabinets when the adjusted cabinet is a base cab, or vise versa", () => {
  
    closeCab.isUpper = false;
    cab.isUpper = true;
    let resList = findAdjacent(cab, wallCabList)
    expect(resList).not.toContain(closeCab)

    closeCab.isUpper = true;
    cab.isUpper = false;
    resList = findAdjacent(cab, wallCabList)
    expect(resList).not.toContain(closeCab)

  });

  it("Should not return its own cabinet", () => {
    const resList = findAdjacent(cab, wallCabList)
    expect(resList).not.toContain(cab)
  });
});

describe("findClosestCabinet", () => {
  let closeCab;
  let closeCabList;
  let cab;

  beforeEach(() => {
    closeCabList = cloneDeep(mockedCabinetList);
    cab = closeCabList.splice(0, 1);
    closeCab = closeCabList[1];
    for (const cabinet of closeCabList) {
      cabinet.tempBoundBox = {
        "isBox3": true,
        "min": {
          "x": 13.25,
          "y": 0,
          "z": 13.25
        },
        "max": {
          "x": 16.75,
          "y": 3.5,
          "z": 16.75
        }
      }
      cabinet.measure = {width: 3.5};
      cabinet.distanceAlongWall = 15;
    };
    closeCab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 4.25,
        "y": 0,
        "z": 4.25
      },
      "max": {
        "x": 7.75,
        "y": 3.5,
        "z": 7.75
      }
    };
    closeCab.measure = {width: 3.5};
    closeCab.distanceAlongWall = 6;

    cab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 0,
        "y": 0,
        "z": 0
      },
      "max": {
        "x": 3.5,
        "y": 3.5,
        "z": 3.5
      }
    };

    cab.measure = {width: 3.5};
    cab.distanceAlongWall = 1.75;

  })

  it("Should return the closest cabinet from the list of cabinets", () => {

    let snapCab = findClosest(cab, closeCabList);

    expect(snapCab).toBe(closeCab);
  });

  it("Should return the correct cabinet even when the movement amount is negative", () => {
    closeCab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 3.5,
        "y": 0,
        "z": 0
      },
      "max": {
        "x": 4.5,
        "y": 1,
        "z": 1
      }
    };

    let snapCab = findClosest(cab, closeCabList);

    expect(snapCab).toBe(closeCab);
  });

  it("Should return the correct cabinet when the incorrect cabinet's movement amount is negative", () => {
    for (const cabinet of closeCabList) {
      cabinet.tempBoundBox = {
        "isBox3": true,
        "min": {
          "x": 4,
          "y": 0,
          "z": 0
        },
        "max": {
          "x": 5,
          "y": 1,
          "z": 1
        }
      }
    };
    closeCab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 0.5,
        "y": 0,
        "z": 0
      },
      "max": {
        "x": 1.5,
        "y": 1,
        "z": 1
      }
    };
  });

  it("Should return not crash or do something unexpected if multiple options would have the same distance", () => {
    for (const cabinet of closeCabList) {
      cabinet.tempBoundBox = {
        "isBox3": true,
        "min": {
          "x": 0,
          "y": 0,
          "z": 0
        },
        "max": {
          "x": 1,
          "y": 1,
          "z": 1
        }
      }
    };

    let snapCab = findClosest(cab, closeCabList);

    expect(closeCabList).toContain(snapCab);
  });
});

describe("snapTo", () => {
  let adjustspy = jest.spyOn(Positions, "adjustPositionAlongWall")

  it("it should call adjustPostitionAlongWalls and give it the correct parameters.", () => {
    let cab = cloneDeep(mockedCabinetList[0]);
    let closeCab = cloneDeep(mockedCabinetList[1]);
    closeCab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 0.5,
        "y": 0,
        "z": 0
      },
      "max": {
        "x": 1.5,
        "y": 1,
        "z": 1
      }
    };
    closeCab.measure = {width:3.5}
    cab.tempBoundBox = {
      "isBox3": true,
      "min": {
        "x": 2,
        "y": 0,
        "z": 0
      },
      "max": {
        "x": 3,
        "y": 1,
        "z": 1
      }
    };
    cab.measure = {width:3.5}
    cab.distanceAlongWall= 15 
    closeCab.distanceAlongWall = 5
    let distanceAlongWall = 8.5 + Positions.CABINET_GAP;
    Positions.snapTo(cab, closeCab, adjustspy);

    expect(adjustspy).toHaveBeenCalledWith(cab, distanceAlongWall);

  });

});

describe("adjustPositionAlongWall", () => {

  jest.restoreAllMocks();

  let cab = cloneDeep(mockedCabinetList[0]);
  cab.wall.wallRotation = Math.PI;
  cab.wall.wallLength = 15;
  cab.wall.posX = 10;
  cab.wall.posZ = 10;
  cab.posx = 0;
  cab.posz = 0;
  cab.posy = 0;
  cab.distanceAlongWall = 10;
  cab.measure = {width:3.5}

  let distanceAlongWall = 5;

  it("it should move the cabinet data positions to match the correct position along the wall", () => {
    let bool = adjustPositionAlongWall(cab, distanceAlongWall);

    expect(bool).toBe(true);
    expect(cab.posx).toBe(cab.wall.posX * CONVERSION - distanceAlongWall);
    expect(cab.posz).toBe(cab.wall.posZ * CONVERSION);
  });

  it("it should not change the y position", () => {
    let bool = adjustPositionAlongWall(cab, distanceAlongWall)

    expect(bool).toBe(true);
    expect(cab.posy).toBe(0);
  });

});