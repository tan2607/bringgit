export const patientIntakeSchema = [
  {
    "$el": "h1",
    "children": "Patient Intake Form",
    "attrs": {
      "class": "text-2xl font-bold mb-4"
    }
  },
  {
      "$el":"h2",
      "children":"Personal Information",
       "attrs":{
          "class":"text-xl font-semibold mb-2"
        }
   },
  {
    "$formkit": "text",
    "name": "firstName",
    "label": "First Name",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "lastName",
    "label": "Last Name",
    "validation": "required"
  },
   {
    "$formkit": "text",
    "name": "middleName",
    "label": "Middle Name"
  },
  {
    "$formkit": "email",
    "name": "email",
    "label": "Email Address",
    "validation": "email"
  },
  {
    "$formkit": "tel",
    "name": "phone",
    "label": "Phone Number",
    "validation": "tel"
  },
   {
    "$formkit": "date",
    "name": "dob",
    "label": "Date of Birth",
     "validation": "required"
   },
  {
    "$formkit": "radio",
    "name": "gender",
    "label": "Gender",
      "options": [
        {"label":"Male", "value": "male"},
        {"label":"Female", "value":"female"},
         {"label":"Other", "value":"other"}
      ],
    "validation": "required"
  },

  {
      "$el":"h2",
      "children":"Address",
       "attrs":{
          "class":"text-xl font-semibold mb-2 mt-4"
        }
   },
  {
    "$formkit": "text",
    "name": "streetAddress",
    "label": "Street Address",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "city",
    "label": "City",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "state",
    "label": "State/Province",
    "validation": "required"
  },
  {
    "$formkit": "text",
    "name": "zipCode",
    "label": "Zip/Postal Code",
    "validation": "required|length:5|number"
  },
   {
    "$formkit": "select",
      "label":"Country",
     "name": "country",
      "options":[
        {"label":"United States", "value": "US"},
        {"label":"Canada", "value": "CA"},
        {"label":"Other", "value":"other"}
      ],
      "validation": "required"
    },
  {
    "$el":"h2",
    "children":"Emergency Contact",
     "attrs":{
        "class":"text-xl font-semibold mb-2 mt-4"
      }
   },
    {
    "$formkit": "text",
    "name": "emergencyContactName",
    "label": "Emergency Contact Name",
    "validation": "required"
  },
    {
    "$formkit": "tel",
    "name": "emergencyContactNumber",
    "label": "Emergency Contact Number",
    "validation": "required|tel"
  },
    {
    "$formkit": "text",
    "name": "relationshipToContact",
    "label": "Relationship to Contact",
    "validation": "required"
  },
   {
      "$el":"h2",
      "children":"Medical History",
       "attrs":{
          "class":"text-xl font-semibold mb-2 mt-4"
        }
   },
    {
      "$cmp":"FormKit",
      "props": {
          "name": "allergies",
           "type": "checkbox",
            "id":"allergies",
            "label": "Do you have any allergies?",
             "options": [
                {"label":"Yes", "value": "yes"}
            ]
      }
    },
    {
      "$formkit":"textarea",
      "label": "If yes, please list your allergies.",
      "name": "allergyDescription",
       "if":"$get(allergies).value == 'yes'"
    },
     {
      "$cmp":"FormKit",
      "props": {
           "name": "medicalConditions",
            "type": "checkbox",
            "id":"medicalConditions",
            "label": "Do you have any other medical conditions?",
            "options":[
             {"label":"Yes", "value": "yes"}
            ]
      }
    },
    {
      "$formkit":"textarea",
       "label": "If yes, please list your medical conditions.",
       "name": "medicalConditionsDescription",
       "if":"$get(medicalConditions).value == 'yes'"
    },
   {
      "$formkit": "textarea",
       "label":"Current Medications",
       "name": "medications",
       "help":"Please list all current medications with dosages."
   },
     {
        "$el":"h2",
       "children":"Insurance Information",
       "attrs":{
          "class":"text-xl font-semibold mb-2 mt-4"
        }
     },
    {
    "$formkit": "text",
     "label": "Insurance Provider",
    "name": "insuranceProvider"
  },
  {
    "$formkit": "text",
    "label":"Policy Number",
    "name": "policyNumber"
  },
    {
      "$formkit": "text",
        "label":"Group Number",
        "name": "groupNumber"
  },
 {
    "$cmp":"FormKit",
      "props":{
        "name":"acknowledgement",
        "type":"checkbox",
        "label":"I acknowledge that all of the above information is true and accurate.",
         "validation":"required"
     }
  }
]