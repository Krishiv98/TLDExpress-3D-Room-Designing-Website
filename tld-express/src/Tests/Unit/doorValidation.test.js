
import { describe, it } from '@jest/globals';
import { Cabinet } from '../../Entities/Cabinet';
import { mockedCabinetList } from '../mocks'
import { copyMock, testDoorValidation } from '../testUtil';

describe("doorEntity", () => {

  const sourceCab = Object.assign(new Cabinet(), copyMock(mockedCabinetList[0]))
  sourceCab.attributes = undefined
  const sourceDoor = copyMock(mockedCabinetList[0].attributes.door)
  const badSourceCab = copyMock(sourceCab)
  badSourceCab.posy = null
  const badSourceDoor = copyMock(sourceDoor)
  badSourceDoor.doorID = null
  const expectedResult = mockedCabinetList[0]

  describe("Validation", ()=>{

    it("The Door object should have a doorStyle, which should be a string", () => {
      const door = copyMock(sourceDoor)
      door.doorStyle = null
      testDoorValidation(door, "doorStyle", 'must be a string')
    })

    it("The Door object should have a modelPath, which should be a string", () => {
      const door = copyMock(sourceDoor)
      door.modelPath = null
      testDoorValidation(door, "modelPath", 'must be a string')
    })
  })
})
