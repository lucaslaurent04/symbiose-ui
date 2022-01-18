export var TestData = {
  centers: [
    {id: 1, name: 'Arbrefontaine'},
    {id: 2, name: 'Hastière'},
    {id: 3, name: 'Basseilles'},
    {id: 4, name: 'Bruly'},
    {id: 5, name: 'Bohan'},
    {id: 6, name: 'Daverdisse'},
    {id: 7, name: 'Louvain-La-Neuve'}    
  ],

// demo bookings (map by center_id)
  bookings: {
    // arbrefontaine
    1: [
      {booking_id: 1, date_from: '2021-05-17T14:48:00.000Z', date_to: '2021-05-21T14:48:00.000Z'},
      {booking_id: 2, date_from: '2021-05-28T14:48:00.000Z', date_to: '2021-05-30T14:48:00.000Z'},
      {booking_id: 3, date_from: '2021-06-21T14:48:00.000Z', date_to: '2021-06-25T14:48:00.000Z'}
    ],
    // Hastière
    2: [
      {booking_id: 1, date_from: '2021-05-24T14:48:00.000Z', date_to: '2021-05-28T14:48:00.000Z'},
      {booking_id: 2, date_from: '2021-06-03T14:48:00.000Z', date_to: '2021-06-04T14:48:00.000Z'},
    ],
    // Basseilles
    3: [
      {booking_id: 1, date_from: '2021-05-31T14:48:00.000Z', date_to: '2021-06-04T14:48:00.000Z'},
      {booking_id: 2, date_from: '2021-05-28T14:48:00.000Z', date_to: '2021-05-30T14:48:00.000Z'},
      {booking_id: 3, date_from: '2021-06-12T14:48:00.000Z', date_to: '2021-06-13T14:48:00.000Z'}
    ],
    // Bruly
    4: [
      {booking_id: 1, date_from: '2021-05-17T14:48:00.000Z', date_to: '2021-05-21T14:48:00.000Z'},
      {booking_id: 2, date_from: '2021-05-28T14:48:00.000Z', date_to: '2021-05-30T14:48:00.000Z'},
      {booking_id: 3, date_from: '2021-06-21T14:48:00.000Z', date_to: '2021-06-25T14:48:00.000Z'}
    ],
    // Bohan
    5: [
      {booking_id: 1, date_from: '2021-05-31T14:48:00.000Z', date_to: '2021-06-04T14:48:00.000Z'},
      {booking_id: 2, date_from: '2021-05-28T14:48:00.000Z', date_to: '2021-05-30T14:48:00.000Z'},
      {booking_id: 3, date_from: '2021-06-12T14:48:00.000Z', date_to: '2021-06-13T14:48:00.000Z'}
    ]
},




  available_rental_unit_categories: [
    {
      id: 1,
      name: 'chambres 1 pers.'
    },
    {
      id: 2,
      name: 'chambres 2 pers.'
    },
    {
      id: 3,
      name: 'chambres 3 pers.'
    },
    {
      id: 4,
      name: 'chambres 4 pers.'
    },
    {
      id: 6,
      name: 'Lit dortoir'
    },    
    {
      id: 10,
      name: 'dortoirs'
    },
    {
      id: 11,
      name: 'chambres'
    },
    {
      id: 12,
      name: 'salles'
    }
  ],

  available_rental_units: [
    // chambres génériques
    {
      id: 111,
      name: 'CH1-101',
      description: 'Chambre 101 - 1 personne',
      category_id: {id: 1},
      center_id: {id: 7, name: 'Louvain-La-Neuve'}
    },
    {
      id: 112,
      name: 'CH1-102',
      description: 'Chambre 102 - 1 personne',
      category_id: {id: 1},
      center_id: {id: 7, name: 'Louvain-La-Neuve'}
    },
    {
      id: 113,
      name: 'CH1-103',
      description: 'Chambre 103 - 1 personne',
      category_id: {id: 1},
      center_id: {id: 7, name: 'Louvain-La-Neuve'}      
    },
    {
      id: 121,
      name: 'CH2-201',
      description: 'Chambre 201 - 2 personnes',
      category_id: {id: 2},
      center_id: {id: 7, name: 'Louvain-La-Neuve'}
    },
    {
      id: 122,
      name: 'CH2-202',
      description: 'Chambre 202 - 2 personnes',
      category_id: {id: 2},
      center_id: {id: 7, name: 'Louvain-La-Neuve'}
    },
    {
      id: 131,
      name: 'CH2-301',
      description: 'Chambre 301 - 3 personnes',
      category_id: {id: 3},
      center_id: {id: 7, name: 'Louvain-La-Neuve'}
    },
    {
      id: 141,
      name: 'CH4-401',
      description: 'Chambre 401 - 4 personnes',
      category_id: {id: 4},
      center_id: {id: 7, name: 'Louvain-La-Neuve'}
    },


    {
      // lit en dortoir dans BassSapi
      id: 211,
      name: 'LIT-B-01',
      description: 'Lit dortoir B - 1 personne',
      category_id: {id: 6},
      center_id: {id: 3, name: 'Basseilles'},      
      has_children: false,
      parent_id: 22
    },

    // Basseilles
    {
      id: 21,
      name: 'BassEnt',
      description: 'Basseilles entier',
      type: 'lodge',
      center_id: {id: 3, name: 'Basseilles'},
      capacity: 82,
      has_children: true,
      parent_id: 0
    },

    {
      id: 22,
      name: 'BassSapi',
      description: 'Basseilles Sapinière',
      type: 'dorm',
      center_id: {id: 3, name: 'Basseilles'},
      capacity: 52,
      has_children: true,
      parent_id: 21
    },

    {
      id: 23,
      name: 'BassSci',
      description: 'Basseilels Scierie',
      type: 'dorm',
      center_id: {id: 3, name: 'Basseilles'},
      capacity: 30,
      has_children: true,
      parent_id: 0
    },


    // Arbrefontaine
    {
      id: 1,
      name: 'ArbEnt',
      description: 'Arbrefontainer entier',
      type: 'lodge',
      center_id: {id: 1, name: 'Arbrefontaine'},
      capacity: 74,
      has_children: true,
      parent_id: 0
    },
    {
      id: 2,
      name: 'ArbEcol',
      description: 'Arbrefontainer école',
      type: 'dorm',
      center_id: {id: 1, name: 'Arbrefontaine'},
      capacity: 53,
      has_children: false,
      parent_id: 1
    },
    {
      id: 3,
      name: 'ArbPM-R',
      description: 'Petite Maison + Ruche',
      type: 'lodge',
      center_id: {id: 1, name: 'Arbrefontaine'},
      capacity: 21,
      has_children: true,
      parent_id: 1
    },
    {
      id: 4,
      name: 'ArbPM',
      description: 'Arbrefontaine Petite maison',
      type: 'dorm',
      center_id: {id: 1, name: 'Arbrefontaine'},
      capacity: 13,
      has_children: false,
      parent_id: 3
    },

    // Hastière
    {
      id: 11,
      name: 'HastEnt',
      description: 'Hastière Entier',
      type: 'lodge',
      center_id: {id: 2, name: 'Hastière'},
      capacity: 90,
      has_children: true,
      parent_id: 0
    },
    {
      id: 12,
      name: 'HastAvEnt',
      description: 'Hastière Avant Entier',
      type: 'dorm',
      center_id: {id: 2, name: 'Hastière'},
      capacity: 48,
      has_children: true,
      parent_id: 11
    },
    {
      id: 13,
      name: 'HastAv1',
      description: 'Hastière Avant 1er',
      type: 'lodge',
      center_id: {id: 2, name: 'Hastière'},
      capacity: 24,
      has_children: false,
      parent_id: 12
    },
    {
      id: 14,
      name: 'HastConcEnt',
      description: 'Conciergerie Entier',
      type: 'dorm',
      center_id: {id: 2, name: 'Hastière'},
      capacity: 32,
      has_children: true,
      parent_id: 11
    },
    {
      id: 15,
      name: 'HastConc1',
      description: 'Conciergerie 1er',
      type: 'dorm',
      center_id: {id: 2, name: 'Hastière'},
      capacity: 16,
      has_children: false,
      parent_id: 14
    }    

  ],

  available_products: [

    /*
    NuitCh3
    RepMatin
    RepMidi
    RepSoir
  */

    {
      product_id: {
        id: 1,
        sku: 'NuitDort',
        name: 'Nuitée chambre commune',
        product_model_id: {
          id: 1,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'category',
          rental_unit_category_id: {id: 6},
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '15:00',
          is_pack: false,
          has_own_price: true,
          capacity: 1,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 16.50
      }
    },
    {
      product_id: {
        id: 2,
        sku: 'NuitCh2',
        name: 'Nuitée chambre 2 personnes',
        product_model_id: {
          id: 2,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'category',
          rental_unit_category_id: {id: 2},          
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '15:00',
          is_pack: false,
          has_own_price: true,
          capacity: 2,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 44.00
      }
    },        
    {
      product_id: {
        id: 3,
        sku: 'NuitCh3',
        name: 'Nuitée chambre 3 personnes',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'category',
          rental_unit_category_id: {id: 3},
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '15:00',
          is_pack: false,
          has_own_price: true,
          capacity: 3,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 49.50
      }
    },

    {
      product_id: {
        id: 4,
        sku: 'NuitCh4',
        name: 'Nuitée chambre 4 personnes',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'category',
          rental_unit_category_id: {id: 4},
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '15:00',
          is_pack: false,
          has_own_price: true,
          capacity: 4,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 59.00
      }
    },

    {
      product_id: {
        id: 5,
        sku: 'RepasMatin',
        name: 'Repas du matin (petit déjeuner)',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'person',
          duration: 1,
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '08:30',
          is_pack: false,
          has_own_price: true,
          schedule_offset: 1,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 5.50
      }
    },


    {
      product_id: {
        id: 6,
        sku: 'RepasMidi',
        name: 'Repas du midi (lunch)',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'person',
          duration: 1,          
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '12:30',          
          is_pack: false,
          has_own_price: true,
          schedule_offset: 1,          
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 11.00
      }
    },

    {
      product_id: {
        id: 7,
        sku: 'RepasSoir',
        name: 'Repas du soir (souper)',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'person',
          duration: 1,          
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '19:00',
          is_pack: false,
          has_own_price: true,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 14.00
      }
    },

    {
      product_id: {
        id: 8,
        sku: 'RepasSupp',
        name: 'Repas supplémentaire CDV',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'person',
          duration: 1,
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'timerange',
          schedule_default_value: '12:30',          
          is_pack: false,
          has_own_price: true,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 4.00
      }
    },

    {
      product_id: {
        id: 9,
        sku: 'AssurAnnul',
        name: 'Assurance annulation',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'unit',
          type: 'service',
          service_type: 'simple',
          is_pack: false,
          has_own_price: true,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 10.00
      }
    },

    
    
    {
      product_id: {
        id: 10,
        sku: 'ArbFonEnt',
        name: 'Arbrefontaine entier',
        product_model_id: {
          id: 10,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'unit',
          rental_unit_id: {id: 1},
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '11:00',
          is_pack: false,
          has_own_price: true,
          capacity: 50,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.0
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 716
      }
    },

// ArbFontEcol  492 tvac
// ArbFontPM    142 tvac
// ArbFontPMRu  224 tvac

    
    {
      product_id: {
        id: 11,
        sku: 'NuitCDV',
        name: 'Nuitée logement CDV',
        product_model_id: {
          id: 10,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'capacity',
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '11:00',
          is_pack: false,
          has_own_price: true,
          capacity: 50,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.0
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 12.50
      }
    },


    {
      product_id: {
        id: 20,
        sku: 'FraisHastConc',
        name: 'Frais Hastière Conciergerie',
        product_model_id: {
          id: 3,
          qty_accounting_method: 'unit',
          type: 'service',
          service_type: 'simple',
          is_pack: false,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.06
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 50.00
      }
    },
    {
      product_id: {
        id: 21,
        sku: 'NuitHastConc',
        name: 'Nuitée Hastière Conciergerie',
        product_model_id: {
          id: 10,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'unit',
          rental_unit_id: {id: 14},
          type: 'service',
          service_type: 'schedulable',
          schedule_type: 'time',
          schedule_default_value: '11:00',
          is_pack: false,
          capacity: 50,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        }
      },
      price_id: {
        id: 1,
        price: 200.00
      }
    },


    {
      product_id: {
        id: 40,
        sku: 'CH4PC',
        name: 'Chambre 4 pers. - Pension complète',
        product_model_id: {
          id: 1,
          is_pack: true,
          has_own_price: true,
          qty_accounting_method: 'accomodation',
          capacity: 4,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          },
        },          
        pack_lines_ids: [
          // nuit 4 pers
          {
            parent_product_id: 1,
            child_product_id: 4,
            offset: 0
          },
          // test : nuit dort - il est possible d'assigner plusieurs UL à un pack
/*          
          {
            parent_product_id: 1,
            child_product_id: 1,
            offset: 0
          },
*/          
          // repas matin
          {
            parent_product_id: 1,
            child_product_id: 5,
            offset: 1
          },
          // repas midi
          {
            parent_product_id: 1,
            child_product_id: 6,
            offset: 1
          },
          // repas soir
          {
            parent_product_id: 1,
            child_product_id: 7,
            offset: 0
          }
        ]
      },
      price_id: {
        id: 1,
        price: 250.00
      }
    },


    {
      product_id: {
        id: 30,
        sku: 'CH3PC',
        name: 'Chambre 3 pers. - Pension complète',
        product_model_id: {
          id: 2,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'category',
          is_pack: true,
          has_own_price: true,
          capacity: 3,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.0
            }
          }    
        },
        pack_lines_ids: [
          // nuit 3 pers
          {
            parent_product_id: 1,
            child_product_id: 3,
            offset: 0
          },
          // repas matin
          {
            parent_product_id: 1,
            child_product_id: 5,
            offset: 1
          },
          // repas midi
          {
            parent_product_id: 1,
            child_product_id: 6,
            offset: 1

          },
          // repas soir
          {
            parent_product_id: 1,
            child_product_id: 7,
            offset: 0
          }
        ]        
      },
      price_id: {
        id: 1,
        price: 80.00
      }
    },

    {
      product_id: {
        id: 80,
        sku: 'CDV-3J-PC-MAT',
        name: 'Séjour scolaire 3 jours Maternelles',
        product_model_id: {
          id: 2,
          qty_accounting_method: 'person',
          rental_unit_assignement: 'category',
          is_pack: true,
          has_own_price: true,
          duration: 2,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          }    
        },
        pack_lines_ids: [
          // nuitée CDV
          {
            parent_product_id: 1,
            child_product_id: 11,
            offset: 0
          },
          // repas matin
          {
            parent_product_id: 1,
            child_product_id: 5,
            offset: 1
          },
          // repas midi
          {
            parent_product_id: 1,
            child_product_id: 6,
            offset: 1
          },
          // repas soir
          {
            parent_product_id: 1,
            child_product_id: 7,
            offset: 0
          },
          // repas supplémentaire jour arrivée
          {
            parent_product_id: 1,
            child_product_id: 8,
            offset: 0,
            has_own_qty: true,
            own_qty: 1
          }

        ]        
      },
      price_id: {
        id: 1,
        price: 110.00
      }
    },




    {
      product_id: {
        id: 90,
        sku: 'SEJ-HAST-CONC',
        name: 'Séjour Hastière Conciergerie',
        product_model_id: {
          id: 2,
          qty_accounting_method: 'accomodation',
          rental_unit_assignement: 'category',
          capacity: 50,
          is_pack: true,
          has_own_price: false,
          duration: 2,
          selling_accouting_rule: {
            vat_rule_id: {
              id: 1,
              rate: 0.21
            }
          }    
        },
        pack_lines_ids: [
          // FraisHastConc
          {
            parent_product_id: 1,
            child_product_id: 20,
            offset: 0,
            has_own_qty: true,
            own_qty: 1
          },
          // NuitHastConc
          {
            parent_product_id: 1,
            child_product_id: 21,
            offset: 0
          }
        ]        
      },
      price_id: {
        id: 1,
        price: 225.00
      }
    },    


  ]

}