// Chat Content Configuration
const ChatContent = {
    // Header information
    header: {
        title: "MY-CustA-MDROps",
        subtitle: "CustA-PIC1, Sangfor-CSM, Sangfor-T2",
        avatar: "CA"
    },
    
    // Date separator - will be dynamically set to dd/mm/yyyy format
    dateLabel: "13/02/2026", // Default, will be overridden
    
    // All chat messages in order
    messages: [
        // Text messages
        {
            id: 1,
            type: "csm",
            sender: "Sangfor-CSM",
            content: {
                type: "multiline",
                lines: [
                    "[Sangfor: Security incident Notification]",
                    "Incident name: Threats detected (Webshell threats)",
                    "Incident Type: WebShell Upload",
                    "Incident ID: E25081200005",
                    "Affected Assets: 192.168.0.66 (WEBVM10)",
                    "",
                    "File Path:",
                    "c:\\inetpub\\wwwroot\\custA\\maintenance\\af02ddb6-a984-4b2a-be8a-2e8067415a57.aspx",
                    "",
                    "Status:",
                    "Pending",
                    "",
                    "Recommendations:",
                    "1. Investigate how the web shell was uploaded to the web server by analyzing the web access logs.",
                    "2. Implement a reliable Web Application Firewall (WAF) to protect web server against web shell upload.",
                    "3. Contact Sangfor team for remote incident response investigation to find out the root cause of the web shell upload.",
                    ""
                ]
            }
        },
        {
            id: 2,
            type: "csm",
            sender: "Sangfor-CSM",
            content: {
                type: "image",
                url: "images/MaliciousCode.jpg",
                alt: "Malicious Code",
                fit: "cover",
            }
        },
        {
            id: 3,
            type: "csm",
            sender: "Sangfor-CSM",
            content: "This is the malicious code we found in your webpage."
        },
        {
            id: 4,
            type: "customer",
            sender: "CustA-PIC1",
            content: "We don't have resources to manage this incident currently. Can you help us investigate?"
        },
        {
            id: 5,
            type: "t2",
            sender: "Sangfor-T2",
            content: "Sure. Please grant us remote access to the server for us to investigate further."
        },
        {
            id: 6,
            type: "customer",
            sender: "CustA-PIC1",
            content: "Sure, here is the AnyDesk address."
        },
        {
            id: 7,
            type: "customer",
            sender: "CustA-PIC1",
            content: {
                type: "image",
                url: "images/AnyDesk.jpg",
                alt: "AnyDesk",
                fit: "cover",
            }
        },
        {
            id: 8,
            type: "t2",
            sender: "Sangfor-T2",
            content: "Thanks. Please hold while we investigate. "
        },
        {
            id: 9,
            type: "t2",
            sender: "Sangfor-T2",
            content: {
                type: "multiline",
                lines: [
                    "Hi @ALL, the incident investigation results for the asset 192.168.0.66 (WEBVM10) are as follows:",
                    "",
                    "Summary:",
                    "During the investigation, we found that the '/api/codUploadPost' interface on server 192.168.0.66 (WEBVM10) has an unauthorized access vulnerability. Hackers can exploit this issue to upload webshells withtout logging into the system, and they can gain control of the server.",
                    "",
                    "Suggestions:",
                    "1. Block the attacker's IP address: 82.13.222.130.",
                    "2. Perform a full system scan to detect and remove any webshells or malicious files. Then, restart the service to clear any in-memory trojans.",
                    "3. Fix the file upload vulnerability in the following path: c:\\inetpub\\wwwroot\\custA\\controllers\\coduploadcontrollers.cs",
                    "",
                ]
            }
        },
        {
            id: 10,
            type: "t2",
            sender: "Sangfor-T2",
            content: {
                type: "image",
                url: "images/MalFilePath.jpg",
                alt: "Malicious File Path",
                fit: "cover",
            }
        },
        {
            id: 11,
            type: "t2",
            sender: "Sangfor-T2",
            content: {
                type: "image",
                url: "images/WebShellUpload.jpg",
                alt: "Web Shell Upload",
                fit: "cover",
            }
        },
        {
            id: 12,
            type: "t2",
            sender: "Sangfor-T2",
            content: {
                type: "image",
                url: "images/WebServerLog.jpg",
                alt: "Web Server Log",
                fit: "cover",
            }
        },
        {
            id: 13,
            type: "t2",
            sender: "Sangfor-T2",
            content: "To prevent being attacked again before the vulnerability is fixed, please confirm whether it is possible to limit the acces permission to only allow internal network access to 192.168.0.66 (WEBVM10) and disable public network access to 192.168.0.66 (WEBVM10)."
        },
        {
            id: 14,
            type: "customer",
            sender: "CustA-PIC1",
            content: "We need to work with our application vendor to patch the vulnerability. Anything can be done in the mean time?"
        },
        {
            id: 15,
            type: "csm",
            sender: "Sangfor-CSM",
            content: {
                type: "multiline",
                lines: [
                    "I would like to get your permission to perform these actions in the integrated devices (NGFW and EPP) if the file is confimed not used for business operations:",
                    "1. Quarantine webshell file c:\\inetpub\\wwwroot\\custA\\maintenance\\af02ddb6-a984-4b2a-be8a-2e8067415a57.aspx",
                    "2. Block attacker IP 82.13.222.130 in HQ and Co-location firewall.",
                    "3. Perform full scan to detect and remove remaining malicious files in 192.168.0.66 (WEBVM10)."
                ]
            }
        },
        {
            id: 16,
            type: "customer",
            sender: "CustA-PIC1",
            content: "Who will perform these tasks?"
        },
        {
            id: 17,
            type: "csm",
            sender: "Sangfor-CSM",
            content: "We will perform the task now. Just need your approval."
        },
        {
            id: 18,
            type: "customer",
            sender: "CustA-PIC1",
            content: "Please proceed. Thanks."
        },
        {
            id: 19,
            type: "csm",
            sender: "Sangfor-CSM",
            content: "Noted."
        },
        {
            id: 20,
            type: "csm",
            sender: "Sangfor-CSM",
            content: "File has been quarantined and the malicious IP has been added to both firewalls (HQ & Co-location) global blacklist. Now will proceed to perform full scan."
        },
        {
            id: 21,
            type: "t2",
            sender: "Sangfor-T2",
            content: {
                type: "image",
                url: "images/NGFW.jpg",
                alt: "NGFW",
                fit: "cover",
                caption: "NGFW blacklist policy.",
            }
        },
        {
            id: 22,
            type: "t2",
            sender: "Sangfor-T2",
            content: {
                type: "image",
                url: "images/EPP.jpg",
                alt: "EPP",
                fit: "cover",
                caption: "EPP File Quarantine.",
            }
        },
        {
            id: 23,
            type: "customer",
            sender: "CustA-PIC1",
            content: "Noted with thanks. Will there be an incident report sent out for this?"
        },
        {
            id: 24,
            type: "csm",
            sender: "Sangfor-CSM",
            content: "Incident response report has been sent to the agreed designated receipients. The password for the report is the same as your monthly reports. "
        },
        {
            id: 25,
            type: "customer",
            sender: "CustA-PIC1",
            content: "Received. Thanks."
        },
        // SECOND DATE SEPARATOR WILL BE INSERTED DYNAMICALLY AFTER ID 22
        // Messages after this point will have today's date
        {
            id: 26,
            type: "t2",
            sender: "Sangfor-T2",
            content: "Hi @CustA-PIC1, can we confirm if the vulnerable code in your application has been fixed?"
        },
        {
            id: 27,
            type: "customer",
            sender: "CustA-PIC1",
            content: "According to the recommendation in the report?"
        },
        {
            id: 28,
            type: "customer",
            sender: "CustA-PIC1",
            content: {
                type: "image",
                url: "images/Recommendation.jpg",
                alt: "Recommendation",
                fit: "cover",
            }
        },
        {
            id: 29,
            type: "t2",
            sender: "Sangfor-T2",
            content: "Yes."
        },
        {
            id: 30,
            type: "customer",
            sender: "CustA-PIC1",
            content: "OK. Development team will review it first. Thanks!"
        }
    ],
    
    // Configuration for timestamp generation
    timestampConfig: {
        maxMinutesBetween: 7,
        businessHoursStart: 9,
        businessHoursEnd: 18,
        hoursToAddAfterHours: 7,
        hoursToAddBusinessHours: 12
    }
};

// Dynamic date setter - runs immediately to set dates in dd/mm/yyyy format
(function setDynamicDates() {
    try {
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        
        // Format: dd/mm/yyyy
        const formatDDMMYYYY = (date) => {
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };
        
        // Set initial date separator to yesterday in dd/mm/yyyy format
        ChatContent.dateLabel = formatDDMMYYYY(yesterday);
        
        // Store today's date for the second separator
        ChatContent.todayDate = formatDDMMYYYY(now);
        
        console.log(`📅 Yesterday date set to: ${ChatContent.dateLabel}`);
        console.log(`📅 Today date set to: ${ChatContent.todayDate}`);
    } catch (error) {
        console.error('Error setting dynamic date:', error);
        ChatContent.dateLabel = '13/02/2026'; // Fallback
        ChatContent.todayDate = '14/02/2026'; // Fallback
    }
})();