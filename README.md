# XaminityIQ-Server

<pre> ```flowchart TD
    A[Admin Login] --> B{Authentication Success?}
    B -->|No| B1[Show Error Message] --> A
    B -->|Yes| C[Admin Dashboard]
    
    C --> D{Choose Action}
    D --> E[Create Users]
    D --> F[Create Exam]
    D --> G[Manage Results]
    
    %% User Creation Flow
    E --> E1{Creation Method}
    E1 -->|Single User| E2[Fill User Form]
    E1 -->|Bulk Upload| E3[Upload CSV File]
    
    E2 --> E4{Valid Data?}
    E4 -->|No| E5[Show Validation Errors] --> E2
    E4 -->|Yes| E6[Create User Account]
    
    E3 --> E7{Valid CSV Format?}
    E7 -->|No| E8[Show CSV Errors] --> E3
    E7 -->|Yes| E9{All Records Valid?}
    E9 -->|No| E10[Show Invalid Records] --> E11{Fix or Skip?}
    E11 -->|Fix| E3
    E11 -->|Skip| E12[Create Valid Users Only]
    E9 -->|Yes| E12
    
    E6 --> E13[Send Email with Credentials]
    E12 --> E13
    E13 --> E14{Email Sent Successfully?}
    E14 -->|No| E15[Log Email Failure] --> E16[Retry Email]
    E14 -->|Yes| E17[User Creation Complete]
    E16 --> E14
    
    %% User First Login Flow
    E17 --> U1[User Receives Email]
    U1 --> U2[User Attempts Login]
    U2 --> U3{Valid Credentials?}
    U3 -->|No| U4[Show Login Error] --> U2
    U3 -->|Yes| U5{First Login?}
    U5 -->|No| U6[User Dashboard]
    U5 -->|Yes| U7[Force Password Change]
    U7 --> U8{Password Meets Policy?}
    U8 -->|No| U9[Show Password Rules] --> U7
    U8 -->|Yes| U10[Update Password] --> U6
    
    %% Exam Creation Flow
    F --> F1[Fill Exam Details Form]
    F1 --> F2{Exam Type}
    F2 -->|Proctored| F3[Select Faculty for Proctoring]
    F2 -->|Automatic| F4[Set Exam Duration & Dates]
    
    F3 --> F5{Faculty Available?}
    F5 -->|No| F6[Show Available Faculty] --> F3
    F5 -->|Yes| F7[Assign Proctoring Faculty]
    
    F4 --> F8[Configure Auto-Exam Settings]
    F7 --> F9[Select Students for Exam]
    F8 --> F9
    
    F9 --> F10{Students Selected?}
    F10 -->|No| F11[Mandatory Student Selection] --> F9
    F10 -->|Yes| F12[Configure Correction Settings]
    
    F12 --> F13{Correction Faculty Assignment}
    F13 -->|Assign Now| F14[Select Correction Faculty]
    F13 -->|Assign Later| F15[Save Exam Configuration]
    
    F14 --> F16{Faculty Available for Correction?}
    F16 -->|No| F17[Show Available Faculty] --> F14
    F16 -->|Yes| F15
    
    F15 --> F18[Create Exam Successfully]
    F18 --> F19[Notify Students & Faculty]
    F19 --> F20{Notifications Sent?}
    F20 -->|Failed| F21[Log Notification Errors]
    F20 -->|Success| F22[Exam Created & Scheduled]
    
    %% Student Exam Dashboard
    U6 --> S1{User Type}
    S1 -->|Student| S2[Student Dashboard]
    S1 -->|Faculty| T1[Faculty Dashboard]
    
    S2 --> S3{Exams Available?}
    S3 -->|No| S4[No Exams Message]
    S3 -->|Yes| S5[Show Exam List]
    S5 --> S6[Select Exam]
    S6 --> S7{Exam Status}
    S7 -->|Not Started| S8{Exam Type Check}
    S7 -->|In Progress| S9[Resume Exam]
    S7 -->|Completed| S10[View Results]
    S7 -->|Expired| S11[Show Expired Message]
    
    %% Proctored Exam Flow
    S8 -->|Proctored| S12{Exam Time?}
    S12 -->|Too Early| S13[Show Exam Schedule]
    S12 -->|Too Late| S14[Exam Missed]
    S12 -->|Correct Time| S15[System Requirements Check]
    
    S15 --> S16{Camera & Audio Available?}
    S16 -->|No| S17[Hardware Requirements Error] --> S15
    S16 -->|Yes| S18[Start Proctored Session]
    
    S18 --> S19{Faculty Online?}
    S19 -->|No| S20[Wait for Faculty] --> S21{Timeout Reached?}
    S21 -->|Yes| S22[Reschedule Exam]
    S21 -->|No| S19
    S19 -->|Yes| S23[Begin Proctored Exam]
    
    %% Automatic Exam Flow
    S8 -->|Automatic| S24{Exam Period Valid?}
    S24 -->|No| S25[Outside Exam Period]
    S24 -->|Yes| S26[System Requirements Check]
    
    S26 --> S27{Camera & Audio Available?}
    S27 -->|No| S28[Hardware Requirements Error] --> S26
    S27 -->|Yes| S29[Start Auto-Proctored Session]
    S29 --> S30[Begin Automatic Exam]
    
    %% Exam Taking Process
    S23 --> EX1[Taking Exam]
    S30 --> EX1
    S9 --> EX1
    
    EX1 --> EX2{Technical Issues?}
    EX2 -->|Yes| EX3[Report Technical Issue] --> EX4[Admin Intervention]
    EX2 -->|No| EX5[Continue Exam]
    
    EX4 --> EX6{Issue Resolved?}
    EX6 -->|No| EX7[Reschedule Exam]
    EX6 -->|Yes| EX5
    
    EX5 --> EX8{Exam Completed?}
    EX8 -->|Time Up| EX9[Auto Submit]
    EX8 -->|Student Submits| EX10[Manual Submit]
    EX8 -->|Disconnection| EX11[Handle Disconnection]
    
    EX11 --> EX12{Reconnection Possible?}
    EX12 -->|Yes| EX13[Resume Exam] --> EX5
    EX12 -->|No| EX14[Force Submit Current Answers]
    
    EX9 --> EX15[Exam Submission Complete]
    EX10 --> EX15
    EX14 --> EX15
    
    %% Faculty Dashboard Flow
    T1 --> T2{Faculty Role}
    T2 -->|Proctor| T3[Proctoring Dashboard]
    T2 -->|Corrector| T4[Correction Dashboard]
    T2 -->|Both| T5[Combined Dashboard]
    
    T3 --> T6{Active Proctoring Sessions?}
    T6 -->|No| T7[No Active Sessions]
    T6 -->|Yes| T8[Monitor Student Videos]
    
    T8 --> T9{Suspicious Activity?}
    T9 -->|Yes| T10[Flag Student] --> T11[Send Warning]
    T9 -->|No| T12[Continue Monitoring]
    T11 --> T12
    T12 --> T8
    
    %% Correction Flow
    EX15 --> C1{Correction Faculty Assigned?}
    C1 -->|No| C2[Admin Assigns Faculty] --> C3[Notify Faculty]
    C1 -->|Yes| C3
    
    C3 --> C4[Faculty Receives Correction Task]
    T4 --> C5{Exams to Correct?}
    T5 --> C5
    C4 --> C5
    
    C5 -->|No| C6[No Exams to Correct]
    C5 -->|Yes| C7[Select Exam to Correct]
    C7 --> C8[Review Student Answers]
    C8 --> C9[Assign Marks]
    C9 --> C10{All Questions Corrected?}
    C10 -->|No| C8
    C10 -->|Yes| C11[Submit Correction]
    C11 --> C12[Send to Admin for Approval]
    
    %% Result Approval Flow
    G --> R1{Corrections Pending Approval?}
    R1 -->|No| R2[No Pending Results]
    R1 -->|Yes| R3[Review Corrections]
    C12 --> R3
    
    R3 --> R4{Approve Results?}
    R4 -->|No| R5[Send Back for Re-correction] --> C4
    R4 -->|Yes| R6[Approve Results]
    R6 --> R7[Release Results to Students]
    R7 --> R8{Results Released Successfully?}
    R8 -->|No| R9[Handle Release Errors]
    R8 -->|Yes| R10[Results Available to Students]
    
    %% Student Result View
    S10 --> R11{Results Released?}
    R10 --> R11
    R11 -->|No| R12[Results Pending]
    R11 -->|Yes| R13[Display Results]
    R13 --> R14[View Detailed Scores]
    
    %% Error Handling & Edge Cases
    EX2 -->|Connection Lost| EC1[Handle Connection Loss]
    EC1 --> EC2{Reconnect Possible?}
    EC2 -->|Yes| EC3[Restore Session] --> EX5
    EC2 -->|No| EC4[Save Current Progress] --> EC5[Schedule Makeup Exam]
    
    F20 -->|Partial Failure| EC6[Retry Failed Notifications]
    EC6 --> EC7{Retry Successful?}
    EC7 -->|Yes| F22
    EC7 -->|No| EC8[Manual Notification Required]
    
    S16 -->|Permission Denied| EC9[Guide Permission Setup]
    S27 -->|Permission Denied| EC9
    EC9 --> EC10{Permission Granted?}
    EC10 -->|Yes| S18
    EC10 -->|No| EC11[Alternative Exam Arrangement]
    
    T8 -->|Video Issues| EC12[Technical Support]
    EC12 --> EC13{Issue Resolved?}
    EC13 -->|Yes| T8
    EC13 -->|No| EC14[Backup Proctoring Method]``` </pre>
