resource "azapi_resource" "newswatcher_lapp" {
  depends_on = [azurerm_api_connection.apic_sb]
  type       = "Microsoft.Logic/workflows@2017-07-01"
  name       = "redn-azd-${var.environment_name}-newswatcherde-lapp"
  location   = azurerm_resource_group.rg.location
  parent_id  = azurerm_resource_group.rg.id
  tags       = var.tags
  identity {
    type = "SystemAssigned"
  }
  schema_validation_enabled = false
  body = jsonencode(
  {
    properties = {
      "state" : "Enabled",
      "definition": {
        "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
        "actions": {
            "Condition_Main_Version_and_Page_is_a_News": {
                "actions": {
                    "Apply_to_each_RTNews_but_just_one_in_fact": {
                        "actions": {
                            "Determine_if_it_is_an_update_or_an_unpublishing_request": {
                                "actions": {
                                    "Set_variable_varServiceBusRequestType_to_unpublish": {
                                        "inputs": {
                                            "name": "varServiceBusRequestType",
                                            "value": "X"
                                        },
                                        "runAfter": {},
                                        "type": "SetVariable"
                                    }
                                },
                                "else": {
                                    "actions": {
                                        "Set_variable_varServiceBusRequestType_to_update": {
                                            "inputs": {
                                                "name": "varServiceBusRequestType",
                                                "value": "U"
                                            },
                                            "runAfter": {},
                                            "type": "SetVariable"
                                        }
                                    }
                                },
                                "expression": {
                                    "and": [
                                        {
                                            "equals": [
                                                "@triggerBody()?['REDN_Unpublish']",
                                                true
                                            ]
                                        }
                                    ]
                                },
                                "runAfter": {
                                    "Set_variable_varRTNewsExists_to_true": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "If"
                            },
                            "Send_message_to_news_service_bus_update_item_is_here": {
                                "inputs": {
                                    "body": {
                                        "ContentData": "@{base64('*')}",
                                        "ContentType": "application/json",
                                        "Properties": {
                                            "@{variables('varServiceBusRequestType')}": "@items('Apply_to_each_RTNews_but_just_one_in_fact')['ID']"
                                        }
                                    },
                                    "host": {
                                        "connection": {
                                            "name": "@parameters('$connections')['servicebus']['connectionId']"
                                        }
                                    },
                                    "method": "post",
                                    "path": "/@{encodeURIComponent(encodeURIComponent('${azurerm_servicebus_queue.sb_pagepublishing_queue.name}'))}/messages",
                                    "queries": {
                                        "systemProperties": "None"
                                    }
                                },
                                "runAfter": {
                                    "Determine_if_it_is_an_update_or_an_unpublishing_request": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "ApiConnection"
                            },
                            "Set_variable_varRTNewsExists_to_true": {
                                "inputs": {
                                    "name": "varRTNewsExists",
                                    "value": true
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            },
                            "Update_item": {
                                "inputs": {
                                    "body": {
                                        "REDN_Channels": "@variables('varChannels')",
                                        "REDN_ImageUrl": "@triggerBody()?['BannerImageUrl']",
                                        "REDN_Keywords": "@variables('varKeywords')",
                                        "REDN_LangCd": "@variables('varItemLanguage')",
                                        "REDN_Locations": "@variables('varLocations')",
                                        "REDN_NewsHeader": "@triggerBody()?['REDN_Lead']",
                                        "REDN_NewsTitle": "@variables('varNewsTitle')",
                                        "REDN_NewsUrl": "@variables('varItemUrl')",
                                        "REDN_PageName": "@{uriComponent(variables('varFileNameWithExt'))}",
                                        "REDN_PubFrom": "@triggerBody()?['REDN_PubFrom']",
                                        "REDN_PubTo": "@triggerBody()?['REDN_PubTo']",
                                        "REDN_Sticky": "@triggerBody()?['REDN_Sticky']",
                                        "REDN_StickyDate": "@triggerBody()?['REDN_StickyDate']",
                                        "REDN_Topics": "@variables('varTopics')",
                                        "REDN_Unpublish": "@triggerBody()?['REDN_Unpublish']",
                                        "Title": "@{concat(variables('varItemLanguage'),'_', variables('varFileNameWithExt'))}"
                                    },
                                    "host": {
                                        "connection": {
                                            "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                                        }
                                    },
                                    "method": "patch",
                                    "path": "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/tables/@{encodeURIComponent(encodeURIComponent('${var.rtnews}'))}/items/@{encodeURIComponent(items('Apply_to_each_RTNews_but_just_one_in_fact')['ID'])}",
                                    "retryPolicy": {
                                        "type": "none"
                                    }
                                },
                                "metadata": {
                                    "flowSystemMetadata": {
                                        "swaggerOperationId": "PatchItem"
                                    }
                                },
                                "runAfter": {
                                    "Send_message_to_news_service_bus_update_item_is_here": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "ApiConnection"
                            }
                        },
                        "foreach": "@body('Get_items_RTNews')?['value']",
                        "runAfter": {
                            "Get_items_RTNews": [
                                "Succeeded"
                            ]
                        },
                        "type": "Foreach"
                    },
                    "Create_item_Publishing_Log": {
                        "inputs": {
                            "body": {
                                "REDN_StatusCode": "10",
                                "REDN_StatusText": "Publishing initialized",
                                "Title": "@{concat('Publishing for ', variables('varFileNameWithExt'), ' ', variables('varID'))}"
                            },
                            "host": {
                                "connection": {
                                    "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                                }
                            },
                            "method": "post",
                            "path": "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/tables/@{encodeURIComponent(encodeURIComponent('${var.publishinglog}'))}/items"
                        },
                        "metadata": {
                            "flowSystemMetadata": {
                                "swaggerOperationId": "PostItem"
                            }
                        },
                        "runAfter": {},
                        "type": "ApiConnection"
                    },
                    "Get_items_RTNews": {
                        "inputs": {
                            "host": {
                                "connection": {
                                    "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                                }
                            },
                            "method": "get",
                            "path": "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/tables/@{encodeURIComponent(encodeURIComponent('RTNews'))}/items",
                            "queries": {
                                "$filter": "(REDN_LangCd eq '@{variables('varItemLanguage')}') and ((REDN_PageName eq '@{replace(variables('varFileNameWithExt'),'''','''''')}') or  (REDN_PageName eq '@{uriComponent(variables('varFileNameWithExt'))}'))",
                                "$top": 1,
                                "viewScopeOption": "Default"
                            }
                        },
                        "metadata": {
                            "flowSystemMetadata": {
                                "swaggerOperationId": "GetItems"
                            }
                        },
                        "runAfter": {
                            "Send_an_HTTP_request_to_SharePoint_Write_url_in_publishing_log": [
                                "Succeeded"
                            ]
                        },
                        "type": "ApiConnection"
                    },
                    "No_RTNews_item_means_we_create_one": {
                        "actions": {
                            "Create_item_RTNews": {
                                "inputs": {
                                    "body": {
                                        "REDN_Channels": "@variables('varChannels')",
                                        "REDN_CommentsNumber": 0,
                                        "REDN_ImageUrl": "@triggerBody()?['BannerImageUrl']",
                                        "REDN_Keywords": "@variables('varKeywords')",
                                        "REDN_LangCd": "@variables('varItemLanguage')",
                                        "REDN_LikeNumber": 0,
                                        "REDN_Locations": "@variables('varLocations')",
                                        "REDN_NewsHeader": "@triggerBody()?['REDN_Lead']",
                                        "REDN_NewsTitle": "@variables('varNewsTitle')",
                                        "REDN_NewsUrl": "@variables('varItemUrl')",
                                        "REDN_PageName": "@{uriComponent(variables('varFileNameWithExt'))}",
                                        "REDN_PubFrom": "@triggerBody()?['REDN_PubFrom']",
                                        "REDN_PubTo": "@triggerBody()?['REDN_PubTo']",
                                        "REDN_Sticky": "@triggerBody()?['REDN_Sticky']",
                                        "REDN_StickyDate": "@triggerBody()?['REDN_StickyDate']",
                                        "REDN_Topics": "@variables('varTopics')",
                                        "REDN_Unpublish": "@triggerBody()?['REDN_Unpublish']",
                                        "REDN_ViewNumber": 0,
                                        "Title": "@{concat(variables('varItemLanguage'),'_', variables('varFileNameWithExt'))}"
                                    },
                                    "host": {
                                        "connection": {
                                            "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                                        }
                                    },
                                    "method": "post",
                                    "path": "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/tables/@{encodeURIComponent(encodeURIComponent('RTNews'))}/items",
                                    "retryPolicy": {
                                        "type": "none"
                                    }
                                },
                                "metadata": {
                                    "flowSystemMetadata": {
                                        "swaggerOperationId": "PostItem"
                                    }
                                },
                                "runAfter": {},
                                "type": "ApiConnection"
                            },
                            "Send_message_to_news_service_bus_new_item_is_here": {
                                "inputs": {
                                    "body": {
                                        "ContentData": "@{base64('*')}",
                                        "ContentType": "application/json",
                                        "Properties": {
                                            "@{variables('varServiceBusRequestType')}": "@outputs('Create_item_RTNews')?['body/ID']"
                                        }
                                    },
                                    "host": {
                                        "connection": {
                                            "name": "@parameters('$connections')['servicebus']['connectionId']"
                                        }
                                    },
                                    "method": "post",
                                    "path": "/@{encodeURIComponent(encodeURIComponent('${azurerm_servicebus_queue.sb_pagepublishing_queue.name}'))}/messages",
                                    "queries": {
                                        "systemProperties": "None"
                                    }
                                },
                                "metadata": {
                                    "flowSystemMetadata": {
                                        "swaggerOperationId": "SendMessage"
                                    }
                                },
                                "runAfter": {
                                    "Set_variable_varServiceBusRequestType_to_add": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "ApiConnection"
                            },
                            "Set_variable_varServiceBusRequestType_to_add": {
                                "inputs": {
                                    "name": "varServiceBusRequestType",
                                    "value": "A"
                                },
                                "runAfter": {
                                    "Create_item_RTNews": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "SetVariable"
                            }
                        },
                        "expression": {
                            "equals": [
                                "@variables('varRTNewsExists')",
                                false
                            ]
                        },
                        "runAfter": {
                            "Apply_to_each_RTNews_but_just_one_in_fact": [
                                "Succeeded"
                            ]
                        },
                        "type": "If"
                    },
                    "Send_an_HTTP_request_to_SharePoint_Write_url_in_publishing_log": {
                        "inputs": {
                            "body": {
                                "body": "{\n'__metadata': { 'type': 'SP.Data.PublishinglogListItem' },\n'REDN_PageName': {\n'__metadata': { 'type': 'SP.FieldUrlValue' },\n'Description': '@{encodeURIComponent(variables('varFileNameWithExt'))}',\n'Url': '@{replace(variables('varItemUrl'),'''','%27')}'\n}\n}\n",
                                "headers": {
                                    "Content-Type": "application/json;odata=verbose",
                                    "IF-Match": "*",
                                    "X-HTTP-Method": "Merge",
                                    "accept": "application/json;odata=verbose"
                                },
                                "method": "PATCH",
                                "uri": "_api/web/Lists/GetByTitle('PublishingLog')/items(@{body('Create_item_Publishing_Log')?['ID']})"
                            },
                            "host": {
                                "connection": {
                                    "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                                }
                            },
                            "method": "post",
                            "path": "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/httprequest"
                        },
                        "metadata": {
                            "flowSystemMetadata": {
                                "swaggerOperationId": "HttpRequest"
                            }
                        },
                        "runAfter": {
                            "Create_item_Publishing_Log": [
                                "Succeeded"
                            ]
                        },
                        "type": "ApiConnection"
                    },
                    "Set_variable_varLogText": {
                        "inputs": {
                            "name": "varLogText",
                            "value": "@{body('Send_an_HTTP_request_to_SharePoint_Get_promoted_state')}"
                        },
                        "runAfter": {
                            "No_RTNews_item_means_we_create_one": [
                                "Succeeded"
                            ]
                        },
                        "type": "SetVariable"
                    }
                },
                "expression": {
                    "and": [
                        {
                            "endsWith": [
                                "@variables('varVersionNumber')",
                                ".0"
                            ]
                        },
                        {
                            "equals": [
                                "@variables('varBodyPromotedState')",
                                "2"
                            ]
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varServiceBusRequestType": [
                        "Succeeded"
                    ]
                },
                "type": "If"
            },
            "Condition_if_page_is_a_translation": {
                "actions": {
                    "Condition_if_page_is_french": {
                        "actions": {
                            "Set_variable_varItemLanguage_to_french": {
                                "inputs": {
                                    "name": "varItemLanguage",
                                    "value": "FR"
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            },
                            "Set_variable_varItemUrl_for_french_page": {
                                "inputs": {
                                    "name": "varItemUrl",
                                    "value": "@{concat(variables('varRootUrl'), '/SitePages/fr/', variables('varFileNameWithExt'))}"
                                },
                                "runAfter": {
                                    "Set_variable_varItemLanguage_to_french": [
                                        "Succeeded"
                                    ]
                                },
                                "type": "SetVariable"
                            }
                        },
                        "else": {
                            "actions": {
                                "Condition_if_page_is_german": {
                                    "actions": {
                                        "Set_variable_varItemLanguage_to_german": {
                                            "inputs": {
                                                "name": "varItemLanguage",
                                                "value": "DE"
                                            },
                                            "runAfter": {},
                                            "type": "SetVariable"
                                        },
                                        "Set_variable_varItemUrl_for_german_page": {
                                            "inputs": {
                                                "name": "varItemUrl",
                                                "value": "@{concat(variables('varRootUrl'), '/SitePages/de/', variables('varFileNameWithExt'))}"
                                            },
                                            "runAfter": {
                                                "Set_variable_varItemLanguage_to_german": [
                                                    "Succeeded"
                                                ]
                                            },
                                            "type": "SetVariable"
                                        }
                                    },
                                    "else": {
                                        "actions": {
                                            "Set_variable_varItemLanguage_to_italian": {
                                                "inputs": {
                                                    "name": "varItemLanguage",
                                                    "value": "IT"
                                                },
                                                "runAfter": {},
                                                "type": "SetVariable"
                                            },
                                            "Set_variable_varItemUrl_for_italian_page": {
                                                "inputs": {
                                                    "name": "varItemUrl",
                                                    "value": "@{concat(variables('varRootUrl'), '/SitePages/it/', variables('varFileNameWithExt'))}"
                                                },
                                                "runAfter": {
                                                    "Set_variable_varItemLanguage_to_italian": [
                                                        "Succeeded"
                                                    ]
                                                },
                                                "type": "SetVariable"
                                            }
                                        }
                                    },
                                    "expression": {
                                        "and": [
                                            {
                                                "equals": [
                                                    "@variables('varPageTranslationLanguage')",
                                                    "de"
                                                ]
                                            }
                                        ]
                                    },
                                    "runAfter": {},
                                    "type": "If"
                                }
                            }
                        },
                        "expression": {
                            "contains": [
                                "@variables('varPageTranslationLanguage')",
                                "fr"
                            ]
                        },
                        "runAfter": {},
                        "type": "If"
                    }
                },
                "expression": {
                    "equals": [
                        "@variables('varPageIsTranslated')",
                        true
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varItemUrl_for_root_page": [
                        "Succeeded"
                    ]
                },
                "type": "If"
            },
            "For_each_Channels_from_page": {
                "actions": {
                    "Append_the_termguid_to_varChannels": {
                        "inputs": {
                            "name": "varChannels",
                            "value": "@concat(body('Parse_JSON_from_varProcessingTerm')?['TermGuid'], ';')"
                        },
                        "runAfter": {
                            "Parse_JSON_from_varProcessingTerm": [
                                "Succeeded"
                            ]
                        },
                        "type": "AppendToStringVariable"
                    },
                    "Parse_JSON_from_varProcessingTerm": {
                        "inputs": {
                            "content": "@variables('varProcessingTerm')",
                            "schema": {
                                "properties": {
                                    "odata.type": {
                                        "type": "string"
                                    },
                                    "Label": {
                                        "type": "string"
                                    },
                                    "Path": {},
                                    "TermGuid": {
                                        "type": "string"
                                    },
                                    "Value": {
                                        "type": "string"
                                    },
                                    "WssId": {
                                        "type": "integer"
                                    }
                                },
                                "type": "object"
                            }
                        },
                        "runAfter": {
                            "Set_variable_varProcessingTerm_to_channel": [
                                "Succeeded"
                            ]
                        },
                        "type": "ParseJson"
                    },
                    "Set_variable_varProcessingTerm_to_channel": {
                        "inputs": {
                            "name": "varProcessingTerm",
                            "value": "@{items('For_each_Channels_from_page')}"
                        },
                        "runAfter": {},
                        "type": "SetVariable"
                    }
                },
                "foreach": "@triggerBody()?['REDN_Channels']",
                "runAfter": {
                    "Initialize_variable_varProcessingTerm": [
                        "Succeeded"
                    ]
                },
                "runtimeConfiguration": {
                    "concurrency": {
                        "repetitions": 1
                    }
                },
                "type": "Foreach"
            },
            "For_each_Keywords_from_page": {
                "actions": {
                    "Append_the_termguid_to_varKeywords": {
                        "inputs": {
                            "name": "varKeywords",
                            "value": "@concat(body('Parse_JSON_2')?['TermGuid'], ';')"
                        },
                        "runAfter": {
                            "Parse_JSON_2": [
                                "Succeeded"
                            ]
                        },
                        "type": "AppendToStringVariable"
                    },
                    "Parse_JSON_2": {
                        "inputs": {
                            "content": "@variables('varProcessingTerm')",
                            "schema": {
                                "properties": {
                                    "odata.type": {
                                        "type": "string"
                                    },
                                    "Label": {
                                        "type": "string"
                                    },
                                    "Path": {},
                                    "TermGuid": {
                                        "type": "string"
                                    },
                                    "Value": {
                                        "type": "string"
                                    },
                                    "WssId": {
                                        "type": "integer"
                                    }
                                },
                                "type": "object"
                            }
                        },
                        "runAfter": {
                            "Set_variable_varProcessingTerm_to_keyword": [
                                "Succeeded"
                            ]
                        },
                        "type": "ParseJson"
                    },
                    "Set_variable_varProcessingTerm_to_keyword": {
                        "inputs": {
                            "name": "varProcessingTerm",
                            "value": "@{items('For_each_Keywords_from_page')}"
                        },
                        "runAfter": {},
                        "type": "SetVariable"
                    }
                },
                "foreach": "@triggerBody()?['REDN_Keywords']",
                "runAfter": {
                    "Initialize_variable_varKeywords": [
                        "Succeeded"
                    ]
                },
                "runtimeConfiguration": {
                    "concurrency": {
                        "repetitions": 1
                    }
                },
                "type": "Foreach"
            },
            "For_each_Locations_from_page": {
                "actions": {
                    "Append_the_termguid_to_varLocations_": {
                        "inputs": {
                            "name": "varLocations",
                            "value": "@concat(slice(body('Parse_JSON')?['TermGuid'], 0, indexOf(body('Parse_JSON')?['TermGuid'], '-')), ';')"
                        },
                        "runAfter": {
                            "Parse_JSON": [
                                "Succeeded"
                            ]
                        },
                        "type": "AppendToStringVariable"
                    },
                    "Parse_JSON": {
                        "inputs": {
                            "content": "@variables('varProcessingTerm')",
                            "schema": {
                                "properties": {
                                    "odata.type": {
                                        "type": "string"
                                    },
                                    "Label": {
                                        "type": "string"
                                    },
                                    "Path": {},
                                    "TermGuid": {
                                        "type": "string"
                                    },
                                    "Value": {
                                        "type": "string"
                                    },
                                    "WssId": {
                                        "type": "integer"
                                    }
                                },
                                "type": "object"
                            }
                        },
                        "runAfter": {
                            "Set_variable_varProcessingTerm_to_location": [
                                "Succeeded"
                            ]
                        },
                        "type": "ParseJson"
                    },
                    "Set_variable_varProcessingTerm_to_location": {
                        "inputs": {
                            "name": "varProcessingTerm",
                            "value": "@{items('For_each_Locations_from_page')}"
                        },
                        "runAfter": {},
                        "type": "SetVariable"
                    }
                },
                "foreach": "@triggerBody()?['REDN_Locations']",
                "runAfter": {
                    "Initialize_variable_varLocations": [
                        "Succeeded"
                    ]
                },
                "runtimeConfiguration": {
                    "concurrency": {
                        "repetitions": 1
                    }
                },
                "type": "Foreach"
            },
            "For_each_Topics_from_page": {
                "actions": {
                    "Append_the_termguid_to_varTopics": {
                        "inputs": {
                            "name": "varTopics",
                            "value": "@concat(body('Parse_JSON_3')?['TermGuid'],';')"
                        },
                        "runAfter": {
                            "Parse_JSON_3": [
                                "Succeeded"
                            ]
                        },
                        "type": "AppendToStringVariable"
                    },
                    "Parse_JSON_3": {
                        "inputs": {
                            "content": "@variables('varProcessingTerm')",
                            "schema": {
                                "properties": {
                                    "odata.type": {
                                        "type": "string"
                                    },
                                    "Label": {
                                        "type": "string"
                                    },
                                    "Path": {},
                                    "TermGuid": {
                                        "type": "string"
                                    },
                                    "Value": {
                                        "type": "string"
                                    },
                                    "WssId": {
                                        "type": "integer"
                                    }
                                },
                                "type": "object"
                            }
                        },
                        "runAfter": {
                            "Set_variable_varProcessingTerm_to_topic": [
                                "Succeeded"
                            ]
                        },
                        "type": "ParseJson"
                    },
                    "Set_variable_varProcessingTerm_to_topic": {
                        "inputs": {
                            "name": "varProcessingTerm",
                            "value": "@{items('For_each_Topics_from_page')}"
                        },
                        "runAfter": {},
                        "type": "SetVariable"
                    }
                },
                "foreach": "@triggerBody()?['REDN_Topics']",
                "runAfter": {
                    "Initialize_variable_varTopics": [
                        "Succeeded"
                    ]
                },
                "runtimeConfiguration": {
                    "concurrency": {
                        "repetitions": 1
                    }
                },
                "type": "Foreach"
            },
            "Initialize_variable_varBodyPromotedState": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varBodyPromotedState",
                            "type": "string",
                            "value": "@{body('Send_an_HTTP_request_to_SharePoint_Get_promoted_state')['d']['PromotedState']}"
                        }
                    ]
                },
                "runAfter": {
                    "Send_an_HTTP_request_to_SharePoint_Get_promoted_state": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varChannels": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varChannels",
                            "type": "string"
                        }
                    ]
                },
                "runAfter": {},
                "type": "InitializeVariable"
            },
            "Initialize_variable_varFileNameWithExt": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varFileNameWithExt",
                            "type": "string",
                            "value": "@triggerBody()?['{FilenameWithExtension}']"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varBodyPromotedState": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varID": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varID",
                            "type": "integer",
                            "value": "@triggerBody()?['ID']"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varVersionNumber": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varItemLanguage_default_to_german": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varItemLanguage",
                            "type": "string",
                            "value": "DE"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_var_SPWebLCID": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varItemUrl_for_root_page": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varItemUrl",
                            "type": "string",
                            "value": "@{concat(variables('varRootUrl'), '/SitePages/', variables('varFileNameWithExt'))}"
                        }
                    ]
                },
                "runAfter": {
                    "Switch_normalize_varPageTranslationLanguage": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varKeywords": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varKeywords",
                            "type": "string"
                        }
                    ]
                },
                "runAfter": {
                    "For_each_Locations_from_page": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varLocations": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varLocations",
                            "type": "string"
                        }
                    ]
                },
                "runAfter": {
                    "For_each_Channels_from_page": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varLogText": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varLogText",
                            "type": "string",
                            "value": "@{body('Send_an_HTTP_request_to_SharePoint_Get_Promoted_State')}"
                        }
                    ]
                },
                "runAfter": {
                    "Condition_if_page_is_a_translation": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varNewsTitle": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varNewsTitle",
                            "type": "string",
                            "value": "@{body('Send_an_HTTP_request_to_SharePoint_Get_Promoted_State')['d']['Title']}"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varRTNewsExists": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varPageIsTranslated": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varPageIsTranslated",
                            "type": "boolean",
                            "value": "@body('Send_an_HTTP_request_to_SharePoint_Get_Promoted_State')['d']['OData__SPIsTranslation']\r\n"
                        }
                    ]
                },
                "runAfter": {
                    "Switch_set_default_language_according_to_web_LCID": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varPageRawData": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varPageRawData",
                            "type": "string",
                            "value": "@{body('Send_an_HTTP_request_to_SharePoint_Get_Promoted_State')['d']['CanvasContent1']}"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varNewsTitle": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varPageTranslationLanguage": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varPageTranslationLanguage",
                            "type": "string",
                            "value": "@{body('Send_an_HTTP_request_to_SharePoint_Get_Promoted_State')['d']['OData__SPTranslationLanguage']}"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varPageIsTranslated": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varProcessingTerm": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varProcessingTerm",
                            "type": "string"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varChannels": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varRTNewsExists": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varRTNewsExists",
                            "type": "boolean",
                            "value": false
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varLogText": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varRootUrl": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varRootUrl",
                            "type": "string",
                            "value": "https://${var.tenantname}.sharepoint.com/sites/${var.newsde}"
                        }
                    ]
                },
                "runAfter": {
                    "For_each_Topics_from_page": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varServiceBusRequestType": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varServiceBusRequestType",
                            "type": "string",
                            "value": "Z"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varPageRawData": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varTargetUrl": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varTargetUrl",
                            "type": "string",
                            "value": "https://${var.tenantname}.sharepoint.com/sites/${var.hubsite}"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varRootUrl": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varTopics": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varTopics",
                            "type": "string"
                        }
                    ]
                },
                "runAfter": {
                    "For_each_Keywords_from_page": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_varVersionNumber": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varVersionNumber",
                            "type": "string",
                            "value": "@triggerBody()?['{VersionNumber}']"
                        }
                    ]
                },
                "runAfter": {
                    "Initialize_variable_varFileNameWithExt": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Initialize_variable_var_SPWebLCID": {
                "inputs": {
                    "variables": [
                        {
                            "name": "varSPWebLCID",
                            "type": "string",
                            "value": "@body('Send_an_HTTP_request_to_SharePoint_to_get_current_web_language')['d']['Language']"
                        }
                    ]
                },
                "runAfter": {
                    "Send_an_HTTP_request_to_SharePoint_to_get_current_web_language": [
                        "Succeeded"
                    ]
                },
                "type": "InitializeVariable"
            },
            "Send_an_HTTP_request_to_SharePoint_Get_promoted_state": {
                "inputs": {
                    "body": {
                        "headers": {
                            "Accept": "application/json;odata=verbose",
                            "Content-Type": "application/json;odata=verbose"
                        },
                        "method": "GET",
                        "uri": "_api/web/Lists/SitePages/items(@{triggerBody()?['ID']})"
                    },
                    "host": {
                        "connection": {
                            "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                        }
                    },
                    "method": "post",
                    "path": "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varRootUrl')))}/httprequest"
                },
                "metadata": {
                    "flowSystemMetadata": {
                        "swaggerOperationId": "HttpRequest"
                    }
                },
                "runAfter": {
                    "Initialize_variable_varTargetUrl": [
                        "Succeeded"
                    ]
                },
                "type": "ApiConnection"
            },
            "Send_an_HTTP_request_to_SharePoint_to_get_current_web_language": {
                "inputs": {
                    "body": {
                        "headers": {
                            "Accept": "application/json;odata=verbose",
                            "Content-Type": "application/json;odata=verbose"
                        },
                        "method": "GET",
                        "uri": "_api/web/language"
                    },
                    "host": {
                        "connection": {
                            "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                        }
                    },
                    "method": "post",
                    "path": "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varRootUrl')))}/httprequest"
                },
                "runAfter": {
                    "Initialize_variable_varID": [
                        "Succeeded"
                    ]
                },
                "type": "ApiConnection"
            },
            "Switch_normalize_varPageTranslationLanguage": {
                "cases": {
                    "Case": {
                        "actions": {
                            "Set_variable_varPageTranslationLanguage_to_de": {
                                "inputs": {
                                    "name": "varPageTranslationLanguage",
                                    "value": "de"
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            }
                        },
                        "case": "de-de"
                    },
                    "Case_2": {
                        "actions": {
                            "Set_variable_varPageTranslationLanguage_to_fr": {
                                "inputs": {
                                    "name": "varPageTranslationLanguage",
                                    "value": "fr"
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            }
                        },
                        "case": "fr-fr"
                    },
                    "Case_3": {
                        "actions": {
                            "Set_variable_varPageTranslationLanguage_to_it": {
                                "inputs": {
                                    "name": "varPageTranslationLanguage",
                                    "value": "it"
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            }
                        },
                        "case": "it-it"
                    }
                },
                "default": {
                    "actions": {}
                },
                "expression": "@variables('varPageTranslationLanguage')",
                "runAfter": {
                    "Initialize_variable_varPageTranslationLanguage": [
                        "Succeeded"
                    ]
                },
                "type": "Switch"
            },
            "Switch_set_default_language_according_to_web_LCID": {
                "cases": {
                    "Case": {
                        "actions": {
                            "Set_variable_varItemLanguage_to_german_from_LCID": {
                                "inputs": {
                                    "name": "varItemLanguage",
                                    "value": "DE"
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            }
                        },
                        "case": "1031"
                    },
                    "Case_2": {
                        "actions": {
                            "Set_variable_varItemLanguage_to_french_from_LCID": {
                                "inputs": {
                                    "name": "varItemLanguage",
                                    "value": "FR"
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            }
                        },
                        "case": "1036"
                    },
                    "Case_3": {
                        "actions": {
                            "Set_variable_varItemLanguage_to_italian_from_LCID": {
                                "inputs": {
                                    "name": "varItemLanguage",
                                    "value": "IT"
                                },
                                "runAfter": {},
                                "type": "SetVariable"
                            }
                        },
                        "case": "1040"
                    }
                },
                "default": {
                    "actions": {}
                },
                "expression": "@variables('varSPWebLCID')",
                "runAfter": {
                    "Initialize_variable_varItemLanguage_default_to_german": [
                        "Succeeded"
                    ]
                },
                "type": "Switch"
            }
        },
        "contentVersion": "1.0.0.0",
        "parameters": {
            "$connections": {
                "defaultValue": {},
                "type": "Object"
            }
        },
        "triggers": {
            "When_a_file_is_created_or_modified_(properties_only)": {
                "inputs": {
                    "host": {
                        "connection": {
                            "name": "@parameters('$connections')['sharepointonline']['connectionId']"
                        }
                    },
                    "method": "get",
                    "path": "/datasets/@{encodeURIComponent(encodeURIComponent('https://${var.tenantname}.sharepoint.com/sites/${var.newsde}'))}/tables/@{encodeURIComponent(encodeURIComponent('${var.newsdelist}'))}/onupdatedfileitems"
                },
                "metadata": {
                    "flowSystemMetadata": {
                        "swaggerOperationId": "GetOnUpdatedFileItems"
                    }
                },
                "recurrence": {
                    "frequency": "Minute",
                    "interval": 15
                },
                "splitOn": "@triggerBody()?['value']",
                "type": "ApiConnection"
            }
        }
      },
      "parameters": {
        "$connections": {
            "value": {
                "servicebus": {
                    "connectionId": "${azurerm_api_connection.apic_sb.id}",
                    "connectionName": "${azurerm_api_connection.apic_sb.name}",
                    "id": "${data.azurerm_subscription.sub.id}/providers/Microsoft.Web/locations/${azurerm_resource_group.rg.location}/managedApis/servicebus"
                },
                "sharepointonline": {
                    "connectionId": "${azurerm_api_connection.apic_spo.id}",
                    "connectionName": "${azurerm_api_connection.apic_spo.name}",
                    "id": "${data.azurerm_subscription.sub.id}/providers/Microsoft.Web/locations/${azurerm_resource_group.rg.location}/managedApis/sharepointonline"
                }
            }
        }
      }
    }
  }
  )
}