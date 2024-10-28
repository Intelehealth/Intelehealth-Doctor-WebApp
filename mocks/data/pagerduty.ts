import { PagerdutyList, PagerdutyModel } from "src/app/model/model";

export const mockPagerdutyList: PagerdutyList = {
    "totalItems": 7,
    "tickets": [
        {
            "id": 9,
            "incident_id": "Q3IMYLL3M8X25A",
            "incident_key": "95ada144d0094d8cbec03baf59527fe8",
            "title": "test",
            "priority": "medium",
            "status": "triggered",
            "createdAt": "2024-07-15T06:02:09.000Z",
            "updatedAt": "2024-07-15T06:02:09.000Z"
        },
        {
            "id": 10,
            "incident_id": "Q2R7937ZUNRSV0",
            "incident_key": "3e7246c3884440a48ded3380c7b64ec1",
            "title": "test2",
            "priority": "high",
            "status": "triggered",
            "createdAt": "2024-07-15T07:07:48.000Z",
            "updatedAt": "2024-07-15T07:07:48.000Z"
        }
    ],
    "totalPages": 2,
    "currentPage": 1
}

export const mockPagerdutyObject: { incident : any } = {
    "incident": {
        "incident_number": 18243,
        "title": "Test new one test 20 chars accepting",
        "description": "Test new one test 20 chars accepting",
        "created_at": "2024-07-17T09:18:38Z",
        "updated_at": "2024-07-17T09:18:38Z",
        "status": "triggered",
        "incident_key": "6a41a75614684642b06e1ddd687a27b8",
        "service": {
            "id": "PF4G4QZ",
            "type": "service_reference",
            "summary": "Jira Service",
            "self": "https://api.pagerduty.com/services/PF4G4QZ",
            "html_url": "https://intelehealth-org.pagerduty.com/service-directory/PF4G4QZ"
        },
        "assignments": [
            {
                "at": "2024-07-17T09:18:39Z",
                "assignee": {
                    "id": "PI3V57L",
                    "type": "user_reference",
                    "summary": "Sagar Doke",
                    "self": "https://api.pagerduty.com/users/PI3V57L",
                    "html_url": "https://intelehealth-org.pagerduty.com/users/PI3V57L"
                }
            }
        ],
        "assigned_via": "escalation_policy",
        "last_status_change_at": "2024-07-17T09:18:38Z",
        "resolved_at": null,
        "first_trigger_log_entry": {
            "id": "R4B88YEP999OM4LNVYR4YI4AJA",
            "type": "trigger_log_entry_reference",
            "summary": "Triggered through the website.",
            "self": "https://api.pagerduty.com/log_entries/R4B88YEP999OM4LNVYR4YI4AJA",
            "html_url": "https://intelehealth-org.pagerduty.com/incidents/Q22W8JD8P4GQ2J/log_entries/R4B88YEP999OM4LNVYR4YI4AJA"
        },
        "alert_counts": {
            "all": 0,
            "triggered": 0,
            "resolved": 0
        },
        "is_mergeable": true,
        "escalation_policy": {
            "id": "PNOHX95",
            "type": "escalation_policy_reference",
            "summary": "Jira Service-ep",
            "self": "https://api.pagerduty.com/escalation_policies/PNOHX95",
            "html_url": "https://intelehealth-org.pagerduty.com/escalation_policies/PNOHX95"
        },
        "teams": [
            {
                "id": "P5CI5CV",
                "type": "team_reference",
                "summary": "L1",
                "self": "https://api.pagerduty.com/teams/P5CI5CV",
                "html_url": "https://intelehealth-org.pagerduty.com/teams/P5CI5CV"
            }
        ],
        "impacted_services": [
            {
                "id": "PF4G4QZ",
                "type": "service_reference",
                "summary": "Jira Service",
                "self": "https://api.pagerduty.com/services/PF4G4QZ",
                "html_url": "https://intelehealth-org.pagerduty.com/service-directory/PF4G4QZ"
            }
        ],
        "pending_actions": [],
        "acknowledgements": [],
        "basic_alert_grouping": null,
        "alert_grouping": null,
        "last_status_change_by": {
            "id": "PF4G4QZ",
            "type": "service_reference",
            "summary": "Jira Service",
            "self": "https://api.pagerduty.com/services/PF4G4QZ",
            "html_url": "https://intelehealth-org.pagerduty.com/service-directory/PF4G4QZ"
        },
        "external_references": [],
        "priority": {
            "id": "P1QSWKJ",
            "type": "priority",
            "summary": "P3",
            "self": "https://api.pagerduty.com/priorities/P1QSWKJ",
            "html_url": null,
            "account_id": "PXUYDYZ",
            "color": "f9b406",
            "created_at": "2023-05-04T12:38:28Z",
            "description": "",
            "name": "P3",
            "order": 300000000,
            "schema_version": 0,
            "updated_at": "2023-05-04T12:38:28Z"
        },
        "incidents_responders": [],
        "responder_requests": [],
        "subscriber_requests": [],
        "urgency": "low",
        "body": {
            "details": "Test Desc"
        },
        "id": "Q22W8JD8P4GQ2J",
    }
}