ICFT Contact Information System

1. Project Purpose

Build a secure web-based contact information collection system for ICFT.

The system will initially be used to collect general contact and professional information from professors, researchers, students, professionals, institutional representatives, and other individuals connected to ICFT and related conferences.

A public QR code will direct users to a permanent landing page. From that page, users can open and submit a contact information form.

The QR code must point to a permanent landing page rather than directly to the form so that additional functions can be added later without changing the QR code.

Future functions may include:

* Conference registration
* Conference schedule
* Speaker information
* Event check-in
* Newsletter signup
* Conference announcements
* Feedback forms

These future functions are not part of the first development phase.

⸻

2. Phase One Scope

The first phase must include:

Public pages

1. Permanent landing page
2. Contact information form
3. Submission success page
4. Basic privacy notice

Private administrator pages

1. Administrator login
2. Contact database table
3. Search
4. Filtering
5. Contact detail view
6. Contact editing
7. Administrative notes
8. Contact status management
9. Duplicate-email warning
10. CSV export
11. Archive function

⸻

3. User Access

Public users

Public users may:

* Open the landing page
* Open the contact form
* Enter their own information
* Submit the form
* View a submission confirmation

Public users must not be able to:

* View the database
* View another person’s information
* Search for contacts
* Export data
* Access administrator pages
* Modify another person’s information

Public users do not need to create accounts.

Administrator

During Phase One, only one administrator needs access.

The administrator may:

* Log in securely
* View all submitted contacts
* Search and filter contacts
* View complete contact records
* Edit contact information
* Add administrative notes
* Change contact status
* Review possible duplicate records
* Export records
* Archive records

The system should be designed so that additional administrator roles may be added later.

Potential future roles include:

* Owner
* Administrator
* Editor
* Viewer

Future roles do not need to be implemented during Phase One.

⸻

4. Public Form Fields

The public form must contain the following fields in this order.

1. First Name

* Required
* Short text input
* Allow international characters
* Remove leading and trailing spaces

2. Last Name

* Required
* Short text input
* Allow international characters
* Remove leading and trailing spaces

3. Preferred Name

* Optional
* Short text input

Help text:

The name you would like us to use when communicating with you, if different from your first name.

4. Email Address

* Required
* Email input
* Validate email format
* Remove leading and trailing spaces
* Store the email address in lowercase

5. Role(s)

* Required
* Multiple selections allowed
* At least one role must be selected

Available options:

* Professor / Faculty Member
* Researcher
* Student
* Healthcare Professional
* Government Representative
* NGO / Non-profit Representative
* Industry / Business Representative
* Professional Association Representative
* Community Member
* Independent Professional
* Other

If Other is selected, display a required field:

Please specify your role.

6. Organization or Institution

* Optional
* Short text input

Help text:

Please leave this blank if you are not currently affiliated with or representing an organization or institution.

7. Position or Professional Title

* Optional
* Short text input

Examples:

Professor, Research Associate, Program Director, Graduate Student, Healthcare Consultant

8. Country or Region

* Required
* Use a searchable country or region selector if practical
* Store a consistent value for reporting and filtering

9. General Field of Research or Professional Interest

* Optional
* Short text input

Help text:

Please provide a broad field, such as Forestry, Public Health, Medicine, Psychology, Tourism, or Education.

10. Specific Research Area or Professional Interest

* Optional
* Long text input

Help text:

Please briefly describe your specific research area, professional focus, or topic of interest.

11. Permission to Receive Conference Updates

Display the following question:

Would you like to receive conference announcements and related updates by email?

* Required
* Single selection

Options:

* Yes
* No

The answer must not default to Yes.

Store the date and time when the permission choice is submitted.

⸻

5. Landing Page

The landing page will be the permanent destination of the public QR code.

The page should initially contain:

* ICFT logo placeholder
* Short introduction
* A button labelled “Submit Your Information”
* Basic privacy statement
* ICFT contact information placeholder

The button should open the public contact form.

The page architecture should allow additional cards or buttons to be added later, including:

* Conference Registration
* View Program
* Speaker Information
* Event Check-in
* Newsletter
* Conference Updates
* Contact Us

These future options should not appear in Phase One.

⸻

6. Public Page Text

Page title

ICFT Contact and Professional Interest Form

Introductory text

Please provide your contact and professional information to stay connected with ICFT conferences and related activities. Your information will be kept private and will only be accessible to authorized organizers.

This form is for contact and professional interest collection. It is not a formal conference registration form.

Submit button

Submit Information

Success message

Thank you. Your information has been submitted successfully.

⸻

7. Database Fields

Create a primary contacts table.

Required database fields:

* id
* record_id
* first_name
* last_name
* preferred_name
* email
* roles
* other_role
* organization
* professional_title
* country_region
* general_field
* specific_research_area
* conference_updates_consent
* consent_timestamp
* submission_source
* status
* admin_notes
* duplicate_status
* created_at
* updated_at
* archived_at

Internal ID

Use a UUID as the internal database primary key.

Record ID

Automatically generate a human-readable record ID in this format:

ICFT-C-000001

Each record ID must be unique and must not change after creation.

Submission source

Default value:

QR Code

The design should support future source values such as:

* Conference Website
* Direct Link
* Professor Referral
* Email Invitation
* Manual Entry
* Social Media

Status

Default value:

New

Available values:

* New
* Reviewed
* Contacted
* Follow-up Needed
* Confirmed
* Archived
* Do Not Contact

Duplicate status

Available values:

* No Duplicate Detected
* Possible Duplicate
* Reviewed
* Merged
* Keep Separate

Archive behaviour

Archiving a contact must use soft deletion through the archived_at field.

Do not permanently delete records through the normal administrator interface.

⸻

8. Duplicate Handling

When a new submission is received:

1. Normalize the email address.
2. Check whether the email already exists.
3. If no matching email exists, create a new record.
4. If the email already exists, do not automatically overwrite the previous record.
5. Save the new submission and mark it as Possible Duplicate.
6. Display the possible duplicate to the administrator for manual review.

Do not automatically merge people based only on first name and last name.

⸻

9. Administrator Dashboard

The contact list should display:

* Record ID
* Full Name
* Email
* Role(s)
* Organization
* Country or Region
* General Field
* Status
* Submission Date

The administrator must be able to search by:

* First name
* Last name
* Preferred name
* Email
* Organization
* Country or region
* General field
* Specific research area

The administrator must be able to filter by:

* Role
* Country or region
* General field
* Permission to receive conference updates
* Status
* Duplicate status
* Submission date

The administrator must be able to open a record and:

* View all submitted information
* Edit contact fields
* Add or edit administrative notes
* Change status
* Change duplicate status
* Archive the record
* View created and updated timestamps

⸻

10. Export

Phase One must support CSV export.

Exported CSV files should include all active contact records and their relevant administrator fields.

Archived records should be excluded by default.

The administrator should have an option to include archived records.

Excel XLSX export may be added later but is not required for the first working version.

⸻

11. Privacy and Security

The contact database contains personal information.

The system must:

* Keep all contact records private
* Require authentication for administrator pages
* Enforce access control on the server and database
* Prevent public database queries
* Validate all data on the server
* Protect against SQL injection
* Protect against cross-site scripting
* Use environment variables for secret keys
* Never expose service-role or administrator database keys to the browser
* Use HTTPS in production
* Record consent timestamps
* Support Do Not Contact status
* Avoid unnecessary collection of sensitive information

Do not collect:

* Home addresses
* Birth dates
* Passport information
* Payment information
* Health information
* Emergency contact information
* Travel information
* Accommodation requirements

These may be collected through separate systems later if required.

⸻

12. Spam Protection

The public form should include:

* Server-side validation
* Basic rate limiting
* Bot protection such as Cloudflare Turnstile or an equivalent service
* A hidden honeypot field if appropriate

The rate limit should not be overly strict because multiple participants may use the same institutional or conference Wi-Fi network.

⸻

13. Recommended Technology

Preferred initial technology:

* Next.js
* TypeScript
* PostgreSQL
* Supabase for database and administrator authentication
* Supabase Row Level Security
* A production-compatible hosting platform

Use a maintainable project structure.

Do not use SQLite for the deployed production database.

Do not place sensitive database credentials in source control.

⸻

14. Responsive Design

The public landing page and form must work well on:

* iPhone
* Android phones
* Tablets
* Desktop computers

The form should be easy to complete after scanning a QR code.

Requirements:

* Mobile-first layout
* Large readable labels
* Accessible input controls
* Clear required-field indicators
* Clear validation messages
* No unnecessary animations
* No horizontal scrolling

⸻

15. Accessibility

The interface should include:

* Proper form labels
* Keyboard navigation
* Visible focus indicators
* Sufficient text contrast
* Accessible validation messages
* Semantic HTML
* Screen-reader-friendly input descriptions

⸻

16. Language

Phase One will use English.

The code structure should avoid hard-coding text throughout components so that additional languages can be added later.

A language switcher is not required for Phase One.

⸻

17. Items Not Included in Phase One

Do not implement the following during Phase One:

* Formal conference registration
* Payments
* Abstract submission
* File uploads
* Speaker photo uploads
* Travel arrangements
* Accommodation information
* Event schedule selection
* On-site check-in
* Personal attendee QR codes
* Automated newsletters
* Automated email marketing
* Electronic tickets
* Complex analytics dashboards
* Public attendee profiles
* Participant accounts

⸻

18. Required Deliverables

The completed Phase One project must include:

1. Public landing page
2. Public contact information form
3. Submission confirmation page
4. Privacy notice
5. Administrator login
6. Administrator contact table
7. Contact search
8. Contact filters
9. Contact detail page
10. Contact editing
11. Status management
12. Administrative notes
13. Duplicate-email warning
14. CSV export
15. Archive function
16. Database schema and migrations
17. Environment variable example file
18. Local development instructions
19. Deployment instructions
20. Administrator setup instructions
21. Security and permission documentation
22. Testing checklist
23. README file

⸻

19. Development Principles

* Build only the Phase One scope.
* Do not add unnecessary features.
* Do not make assumptions about missing conference dates or programs.
* Do not expose private data publicly.
* Prefer simple and maintainable implementations.
* Add clear comments only where the code is not self-explanatory.
* Use strict TypeScript.
* Validate data on both client and server.
* Keep database and authentication logic separated from presentation components.
* Make incremental, testable changes.