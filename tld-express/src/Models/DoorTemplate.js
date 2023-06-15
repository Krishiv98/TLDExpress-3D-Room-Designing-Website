let DoorTemplate = {       
    
    doorStyle:
    {
     type: 'string',
     required: true,
     min: 1,
     max: 255,
    },

    modelPath:
    {
     type: 'string',
     required: true,
     min: 1,
     max: 255,
    },

    photoPath:
    {
     type: 'string',
     required: true,
     min: 1,
     max: 255,
    }
}
//});
export default DoorTemplate