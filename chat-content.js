// Chat Content Configuration
const ChatContent = {
    // Header information
    header: {
        title: "MY-CustA-MDROps",
        subtitle: "CustA-PIC1, Sangfor-CSM, Sangfor-T2",
        avatar: "CA"
    },
    
    // Date separator
    dateLabel: "Today",
    
    // All chat messages in order
    messages: [
        // Text messages
        {
            id: 1,
            type: "csm",
            sender: "Sangfor-CSM",
            content: "This is a test."
        },
        {
            id: 2,
            type: "customer",
            sender: "CustA-PIC1",
            content: "What test is this?"
        },
        {
            id: 3,
            type: "t2",
            sender: "Sangfor-T2",
            content: "This is a simulation test to show how good we can be."
        },
        {
            id: 4,
            type: "customer",
            sender: "CustA-PIC1",
            content: "I don't believe you. Prove it."
        },
        {
            id: 5,
            type: "csm",
            sender: "Sangfor-CSM",
            content: "How can I prove it?"
        },
        {
            id: 6,
            type: "customer",
            sender: "CustA-PIC1",
            content: "I don't know. You tell me."
        },
        {
            id: 7,
            type: "t2",
            sender: "Sangfor-T2",
            content: "Ok, the rain in spain falls mainly on the plane."
        },
        {
            id: 8,
            type: "customer",
            sender: "CustA-PIC1",
            content: "What???"
        },
        // Image messages
        {
            id: 9,
            type: "csm",
            sender: "Sangfor-CSM",
            content: {
                type: "image",
                url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                alt: "Server Room Setup",
                fit: "cover",
                caption: "Here's our server room monitoring dashboard for reference."
            }
        },
        {
            id: 10,
            type: "customer",
            sender: "CustA-PIC1",
            content: {
                type: "image",
                url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                alt: "Security Dashboard",
                fit: "contain",
                caption: "This is what we're currently using. Can you match this?"
            }
        },
        {
            id: 11,
            type: "t2",
            sender: "Sangfor-T2",
            content: {
                type: "image",
                url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
                alt: "Network Architecture",
                fit: "contain",
                caption: "Our recommended network security architecture for your environment."
            }
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