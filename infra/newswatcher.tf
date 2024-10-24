resource "azapi_resource" "newswatcher_lapp" {
  for_each = { for idx, site in local.rtnews_sites : idx => site }
  depends_on = [azurerm_api_connection.apic_sb]
  type       = "Microsoft.Logic/workflows@2017-07-01"
  name       = "puntobello-realtimenews-${var.environment_name}-newswatcher${local.rtnews_lcids[each.key]}-lapp"
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
        "definition" : {
          "$schema" : "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
          "actions" : {
            "Condition_Main_Version_and_Page_is_a_News" : {
              "actions" : {
                "Apply_to_each_RTNews_but_just_one_in_fact" : {
                  "actions" : {
                    "Send_message_to_news_service_bus_update_item_is_here" : {
                      "inputs" : {
                        "body" : {
                          "ContentData" : "@{base64('*')}",
                          "ContentType" : "application/json",
                          "Properties" : {
                            "@{variables('varServiceBusRequestType')}" : "@items('Apply_to_each_RTNews_but_just_one_in_fact')['ID']"
                          }
                        },
                        "host" : {
                          "connection" : {
                            "name" : "@parameters('$connections')['servicebus']['connectionId']"
                          }
                        },
                        "method" : "post",
                        "path" : "/@{encodeURIComponent(encodeURIComponent('${azurerm_servicebus_queue.sb_pagepublishing_queue.name}'))}/messages",
                        "queries" : {
                          "systemProperties" : "None"
                        }
                      },
                      "runAfter" : {
                        "Set_variable_varServiceBusRequestType_to_update" : [
                          "Succeeded"
                        ]
                      },
                      "type" : "ApiConnection"
                    },
                    "Set_variable_varRTNewsExists_to_true" : {
                      "inputs" : {
                        "name" : "varRTNewsExists",
                        "value" : true
                      },
                      "runAfter" : {},
                      "type" : "SetVariable"
                    },
                    "Set_variable_varServiceBusRequestType_to_update" : {
                      "inputs" : {
                        "name" : "varServiceBusRequestType",
                        "value" : "U"
                      },
                      "runAfter" : {
                        "Set_variable_varRTNewsExists_to_true" : [
                          "Succeeded"
                        ]
                      },
                      "type" : "SetVariable"
                    },
                    "Update_item" : {
                      "inputs" : {
                        "body" : {
                          "Title" : "@variables('varNewsTitle')",
                          "pb_Channels" : "@variables('varChannels')",
                          "pb_Header" : "@variables('varNewsHeader')",
                          "pb_ImageUrl" : "@triggerBody()?['BannerImageUrl']",
                          "pb_Language" : "@variables('varItemLanguage')",
                          "pb_NewsUrl" : "@variables('varItemUrl')",
                          "pb_PageName" : "@{uriComponent(variables('varFileNameWithExt'))}",
                          "pb_PublishedFrom" : "@triggerBody()?['pb_PublishedFrom']",
                          "pb_PublishedTo" : "@triggerBody()?['pb_PublishedTo']",
                          "pb_Sticky" : "@triggerBody()?['pb_Sticky']",
                          "pb_StickyDate" : "@triggerBody()?['pb_StickyDate']"
                        },
                        "host" : {
                          "connection" : {
                            "name" : "@parameters('$connections')['sharepointonline']['connectionId']"
                          }
                        },
                        "method" : "patch",
                        "path" : "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/tables/@{encodeURIComponent(encodeURIComponent('${var.RTNEWS_LIST_GUID}'))}/items/@{encodeURIComponent(items('Apply_to_each_RTNews_but_just_one_in_fact')['ID'])}",
                        "retryPolicy" : {
                          "type" : "none"
                        }
                      },
                      "metadata" : {
                        "flowSystemMetadata" : {
                          "swaggerOperationId" : "PatchItem"
                        }
                      },
                      "runAfter" : {
                        "Send_message_to_news_service_bus_update_item_is_here" : [
                          "Succeeded"
                        ]
                      },
                      "type" : "ApiConnection"
                    }
                  },
                  "foreach" : "@body('Get_items_RTNews')?['value']",
                  "runAfter" : {
                    "Get_items_RTNews" : [
                      "Succeeded"
                    ]
                  },
                  "type" : "Foreach"
                },
                "Get_items_RTNews" : {
                  "inputs" : {
                    "host" : {
                      "connection" : {
                        "name" : "@parameters('$connections')['sharepointonline']['connectionId']"
                      }
                    },
                    "method" : "get",
                    "path" : "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/tables/@{encodeURIComponent(encodeURIComponent('${var.RTNEWS_LIST_GUID}'))}/items",
                    "queries" : {
                      "$filter" : "(pb_Language eq '@{variables('varItemLanguage')}') and ((pb_PageName eq '@{replace(variables('varFileNameWithExt'),'''','''''')}') or  (pb_PageName eq '@{uriComponent(variables('varFileNameWithExt'))}'))",
                      "$top" : 1,
                      "viewScopeOption" : "Default"
                    }
                  },
                  "metadata" : {
                    "flowSystemMetadata" : {
                      "swaggerOperationId" : "GetItems"
                    }
                  },
                  "runAfter" : {},
                  "type" : "ApiConnection"
                },
                "No_RTNews_item_means_we_create_one" : {
                  "actions" : {
                    "Create_item_RTNews" : {
                      "inputs" : {
                        "body" : {
                          "Title" : "@variables('varNewsTitle')",
                          "pb_Channels" : "@variables('varChannels')",
                          "pb_Header" : "@variables('varNewsHeader')",
                          "pb_ImageUrl" : "@triggerBody()?['BannerImageUrl']",
                          "pb_Language" : "@variables('varItemLanguage')",
                          "pb_NewsUrl" : "@variables('varItemUrl')",
                          "pb_PageName" : "@{uriComponent(variables('varFileNameWithExt'))}",
                          "pb_PublishedFrom" : "@triggerBody()?['pb_PublishedFrom']",
                          "pb_PublishedTo" : "@triggerBody()?['pb_PublishedTo']",
                          "pb_Sticky" : "@triggerBody()?['pb_Sticky']",
                          "pb_StickyDate" : "@triggerBody()?['pb_StickyDate']"
                        },
                        "host" : {
                          "connection" : {
                            "name" : "@parameters('$connections')['sharepointonline']['connectionId']"
                          }
                        },
                        "method" : "post",
                        "path" : "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varTargetUrl')))}/tables/@{encodeURIComponent(encodeURIComponent('${var.RTNEWS_LIST_GUID}'))}/items",
                        "retryPolicy" : {
                          "type" : "none"
                        }
                      },
                      "metadata" : {
                        "flowSystemMetadata" : {
                          "swaggerOperationId" : "PostItem"
                        }
                      },
                      "runAfter" : {},
                      "type" : "ApiConnection"
                    },
                    "Send_message_to_news_service_bus_new_item_is_here" : {
                      "inputs" : {
                        "body" : {
                          "ContentData" : "@{base64('*')}",
                          "ContentType" : "application/json",
                          "Properties" : {
                            "@{variables('varServiceBusRequestType')}" : "@outputs('Create_item_RTNews')?['body/ID']"
                          }
                        },
                        "host" : {
                          "connection" : {
                            "name" : "@parameters('$connections')['servicebus']['connectionId']"
                          }
                        },
                        "method" : "post",
                        "path" : "/@{encodeURIComponent(encodeURIComponent('${azurerm_servicebus_queue.sb_pagepublishing_queue.name}'))}/messages",
                        "queries" : {
                          "systemProperties" : "None"
                        }
                      },
                      "metadata" : {
                        "flowSystemMetadata" : {
                          "swaggerOperationId" : "SendMessage"
                        }
                      },
                      "runAfter" : {
                        "Set_variable_varServiceBusRequestType_to_add" : [
                          "Succeeded"
                        ]
                      },
                      "type" : "ApiConnection"
                    },
                    "Set_variable_varServiceBusRequestType_to_add" : {
                      "inputs" : {
                        "name" : "varServiceBusRequestType",
                        "value" : "A"
                      },
                      "runAfter" : {
                        "Create_item_RTNews" : [
                          "Succeeded"
                        ]
                      },
                      "type" : "SetVariable"
                    }
                  },
                  "expression" : {
                    "equals" : [
                      "@variables('varRTNewsExists')",
                      false
                    ]
                  },
                  "runAfter" : {
                    "Apply_to_each_RTNews_but_just_one_in_fact" : [
                      "Succeeded"
                    ]
                  },
                  "type" : "If"
                }
              },
              "expression" : {
                "and" : [
                  {
                    "endsWith" : [
                      "@variables('varVersionNumber')",
                      ".0"
                    ]
                  },
                  {
                    "equals" : [
                      "@variables('varBodyPromotedState')",
                      "2"
                    ]
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varServiceBusRequestType" : [
                  "Succeeded"
                ]
              },
              "type" : "If"
            },
            "Condition_when_the_page_item_is_a_translation" : {
              "actions" : {
                "Set_variable_varItemLanguage_to_the_page_language" : {
                  "inputs" : {
                    "name" : "varItemLanguage",
                    "value" : "@triggerBody()?['OData__SPTranslationLanguage']?['Value']"
                  },
                  "runAfter" : {},
                  "type" : "SetVariable"
                }
              },
              "else" : {
                "actions" : {
                  "Set_variable_varItemLanguage_to_the_web_language_lcid" : {
                    "inputs" : {
                      "name" : "varItemLanguage",
                      "value" : "@{body('Send_an_HTTP_request_to_SharePoint_to_get_current_web_language')['d']['Language']}"
                    },
                    "runAfter" : {},
                    "type" : "SetVariable"
                  }
                }
              },
              "expression" : {
                "and" : [
                  {
                    "equals" : [
                      "@triggerBody()?['OData__SPIsTranslation']",
                      true
                    ]
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varItemLanguage" : [
                  "Succeeded"
                ]
              },
              "type" : "If"
            },
            "For_each_Channels_from_page" : {
              "actions" : {
                "Append_the_termguid_to_varChannels" : {
                  "inputs" : {
                    "name" : "varChannels",
                    "value" : "@concat(body('Parse_JSON_from_varProcessingTerm')?['TermGuid'], ';')"
                  },
                  "runAfter" : {
                    "Parse_JSON_from_varProcessingTerm" : [
                      "Succeeded"
                    ]
                  },
                  "type" : "AppendToStringVariable"
                },
                "Parse_JSON_from_varProcessingTerm" : {
                  "inputs" : {
                    "content" : "@variables('varProcessingTerm')",
                    "schema" : {
                      "properties" : {
                        "@@odata.type" : {
                          "type" : "string"
                        },
                        "Label" : {
                          "type" : "string"
                        },
                        "Path" : {},
                        "TermGuid" : {
                          "type" : "string"
                        },
                        "Value" : {
                          "type" : "string"
                        },
                        "WssId" : {
                          "type" : "integer"
                        }
                      },
                      "type" : "object"
                    }
                  },
                  "runAfter" : {
                    "Set_variable_varProcessingTerm_to_channel" : [
                      "Succeeded"
                    ]
                  },
                  "type" : "ParseJson"
                },
                "Set_variable_varProcessingTerm_to_channel" : {
                  "inputs" : {
                    "name" : "varProcessingTerm",
                    "value" : "@{items('For_each_Channels_from_page')}"
                  },
                  "runAfter" : {},
                  "type" : "SetVariable"
                }
              },
              "foreach" : "@triggerBody()?['pb_Channels']",
              "runAfter" : {
                "Initialize_variable_varProcessingTerm" : [
                  "Succeeded"
                ]
              },
              "runtimeConfiguration" : {
                "concurrency" : {
                  "repetitions" : 1
                }
              },
              "type" : "Foreach"
            },
            "Initialize_variable_varBodyPromotedState" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varBodyPromotedState",
                    "type" : "string",
                    "value" : "@{body('Send_an_HTTP_request_to_SharePoint_Get_promoted_state')['d']['PromotedState']}"
                  }
                ]
              },
              "runAfter" : {
                "Send_an_HTTP_request_to_SharePoint_Get_promoted_state" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varChannels" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varChannels",
                    "type" : "string"
                  }
                ]
              },
              "runAfter" : {},
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varFileNameWithExt" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varFileNameWithExt",
                    "type" : "string",
                    "value" : "@triggerBody()?['{FilenameWithExtension}']"
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varBodyPromotedState" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varItemLanguage" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varItemLanguage",
                    "type" : "string"
                  }
                ]
              },
              "runAfter" : {
                "Send_an_HTTP_request_to_SharePoint_to_get_current_web_language" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varItemUrl_for_root_page" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varItemUrl",
                    "type" : "string",
                    "value" : "@{concat(variables('varRootUrl'), '/SitePages/', variables('varFileNameWithExt'))}"
                  }
                ]
              },
              "runAfter" : {
                "Condition_when_the_page_item_is_a_translation" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varNewsHeader" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varNewsHeader",
                    "type" : "string",
                    "value" : "@{body('Send_an_HTTP_request_to_SharePoint_Get_Promoted_State')['d']['Description']}"
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varNewsTitle" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varNewsTitle" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varNewsTitle",
                    "type" : "string",
                    "value" : "@{body('Send_an_HTTP_request_to_SharePoint_Get_Promoted_State')['d']['Title']}"
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varVersionNumber" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varProcessingTerm" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varProcessingTerm",
                    "type" : "string"
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varChannels" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varRTNewsExists" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varRTNewsExists",
                    "type" : "boolean",
                    "value" : false
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varItemUrl_for_root_page" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varRootUrl" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varRootUrl",
                    "type" : "string",
                    "value" : "https://${var.TENANT_NAME}.sharepoint.com/sites/${local.rtnews_sites[each.key]}"
                  }
                ]
              },
              "runAfter" : {
                "For_each_Channels_from_page" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varServiceBusRequestType" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varServiceBusRequestType",
                    "type" : "string",
                    "value" : "Z"
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varRTNewsExists" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varTargetUrl" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varTargetUrl",
                    "type" : "string",
                    "value" : "https://${var.TENANT_NAME}.sharepoint.com/sites/${var.RTNEWS_HOME}"
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varRootUrl" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Initialize_variable_varVersionNumber" : {
              "inputs" : {
                "variables" : [
                  {
                    "name" : "varVersionNumber",
                    "type" : "string",
                    "value" : "@triggerBody()?['{VersionNumber}']"
                  }
                ]
              },
              "runAfter" : {
                "Initialize_variable_varFileNameWithExt" : [
                  "Succeeded"
                ]
              },
              "type" : "InitializeVariable"
            },
            "Send_an_HTTP_request_to_SharePoint_Get_promoted_state" : {
              "inputs" : {
                "body" : {
                  "headers" : {
                    "Accept" : "application/json;odata=verbose",
                    "Content-Type" : "application/json;odata=verbose"
                  },
                  "method" : "GET",
                  "uri" : "_api/web/Lists/SitePages/items(@{triggerBody()?['ID']})"
                },
                "host" : {
                  "connection" : {
                    "name" : "@parameters('$connections')['sharepointonline']['connectionId']"
                  }
                },
                "method" : "post",
                "path" : "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varRootUrl')))}/httprequest"
              },
              "metadata" : {
                "flowSystemMetadata" : {
                  "swaggerOperationId" : "HttpRequest"
                }
              },
              "runAfter" : {
                "Initialize_variable_varTargetUrl" : [
                  "Succeeded"
                ]
              },
              "type" : "ApiConnection"
            },
            "Send_an_HTTP_request_to_SharePoint_to_get_current_web_language" : {
              "inputs" : {
                "body" : {
                  "headers" : {
                    "Accept" : "application/json;odata=verbose",
                    "Content-Type" : "application/json;odata=verbose"
                  },
                  "method" : "GET",
                  "uri" : "_api/web/language"
                },
                "host" : {
                  "connection" : {
                    "name" : "@parameters('$connections')['sharepointonline']['connectionId']"
                  }
                },
                "method" : "post",
                "path" : "/datasets/@{encodeURIComponent(encodeURIComponent(variables('varRootUrl')))}/httprequest"
              },
              "runAfter" : {
                "Initialize_variable_varNewsHeader" : [
                  "Succeeded"
                ]
              },
              "type" : "ApiConnection"
            }
          },
          "contentVersion" : "1.0.0.0",
          "parameters" : {
            "$connections" : {
              "defaultValue" : {},
              "type" : "Object"
            }
          },
          "triggers" : {
            "When_a_file_is_created_or_modified_(properties_only)" : {
              "evaluatedRecurrence" : {
                "frequency" : "Day",
                "interval" : 5
              },
              "inputs" : {
                "host" : {
                  "connection" : {
                    "name" : "@parameters('$connections')['sharepointonline']['connectionId']"
                  }
                },
                "method" : "get",
                "path" : "/datasets/@{encodeURIComponent(encodeURIComponent('https://${var.TENANT_NAME}.sharepoint.com/sites/${local.rtnews_sites[each.key]}'))}/tables/@{encodeURIComponent(encodeURIComponent('${local.rtnews_sitespages_guids[each.key]}'))}/onupdatedfileitems"
              },
              "metadata" : {
                "flowSystemMetadata" : {
                  "swaggerOperationId" : "GetOnUpdatedFileItems"
                }
              },
              "recurrence" : {
                "frequency" : "${var.recurrence_frequency}",
                "interval" : "${var.recurrence_interval}"
              },
              "splitOn" : "@triggerBody()?['value']",
              "type" : "ApiConnection"
            }
          }
        },
        "parameters" : {
          "$connections" : {
            "value" : {
              "servicebus" : {
                "connectionId" : "${azurerm_api_connection.apic_sb.id}",
                "connectionName" : "${azurerm_api_connection.apic_sb.name}",
                "id" : "${data.azurerm_subscription.sub.id}/providers/Microsoft.Web/locations/${azurerm_resource_group.rg.location}/managedApis/servicebus"
              },
              "sharepointonline" : {
                "connectionId" : "${azurerm_api_connection.apic_spo.id}",
                "connectionName" : "${azurerm_api_connection.apic_spo.name}",
                "id" : "${data.azurerm_subscription.sub.id}/providers/Microsoft.Web/locations/${azurerm_resource_group.rg.location}/managedApis/sharepointonline"
              }
            }
          }
        }
      }
    }
  )
}