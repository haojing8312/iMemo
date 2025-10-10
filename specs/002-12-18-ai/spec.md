# Feature Specification: Life Milestone Photo Generation with Auto-Style Mode

**Feature Branch**: `002-12-18-ai`
**Created**: 2025-10-08
**Status**: Draft
**Input**: User description: "我们要扩展一下功能，不仅仅包括"百岁照"，要包括人的一生的所有重要时刻，如"出生"、"满月"、"百日照"、"12岁生日"、"18岁成人"、"结婚"等等所有重要时刻，我们的产品叫做"有AI的家庭回忆"，就是要支持人生所有的阶段。同时我们要给用户一个懒人模式，例如用户可以自行选择类型"结婚"，上传几张自己照片，然后一键生成一整套风格各异的结婚照，而不需要每次自己选择风格。同时每种风格以及后台对应的提示词，为了支持后续快速扩展，你要通过可配置的方案来实现。"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Quick Auto-Generation for Milestone Photos (Priority: P1)

A user wants to quickly generate a complete set of milestone photos (e.g., wedding photos) in various artistic styles without manually selecting each style. The user simply selects a milestone type (wedding, 100-day baby, etc.), uploads personal photos, and clicks one button to generate a diverse collection of styled images.

**Why this priority**: This is the core value proposition - eliminating manual style selection friction and providing instant gratification. This enables users to quickly see various interpretations of their milestone moment without deep engagement.

**Independent Test**: Can be fully tested by selecting "Wedding" milestone, uploading 3 photos, clicking "Auto-Generate", and verifying that 12+ images in 3+ different styles are generated within 60 seconds. Delivers immediate value by showing the user multiple artistic interpretations.

**Acceptance Scenarios**:

1. **Given** a user is on the milestone selection screen, **When** they select "Wedding" and upload 2-5 photos, **Then** they see an "Auto-Generate Complete Set" button
2. **Given** a user has uploaded photos and selected a milestone type, **When** they click "Auto-Generate Complete Set", **Then** the system generates 4 images in each of 3-5 predefined styles for that milestone (12-20 total images)
3. **Given** auto-generation is in progress, **When** the user views the progress screen, **Then** they see live updates showing which style is currently being generated and estimated time remaining
4. **Given** auto-generation completes successfully, **When** the user views results, **Then** all generated images are organized by style with clear style labels

---

### User Story 2 - Milestone Type Selection with Category Browsing (Priority: P1)

A user wants to browse and select from a comprehensive list of life milestone types that cover all major life stages from birth to elderly life, organized in an intuitive category structure.

**Why this priority**: Without milestone type selection, the auto-generation feature cannot function. This is the entry point for the entire feature.

**Independent Test**: Can be fully tested by opening the app, viewing all available milestone categories (Infancy, Childhood, Adolescence, Adulthood, Elderly), selecting any milestone type (e.g., "100-Day Baby"), and proceeding to photo upload. Delivers value by helping users find the right occasion quickly.

**Acceptance Scenarios**:

1. **Given** a user opens the application, **When** they navigate to milestone selection, **Then** they see categories organized by life stage: Infancy (0-1 year), Childhood (1-12 years), Adolescence (12-18 years), Adulthood (18-60 years), Elderly (60+ years)
2. **Given** a user selects the "Infancy" category, **When** they view available milestones, **Then** they see options including: Birth, Full Month (满月), 100-Day Celebration (百日照), 1st Birthday
3. **Given** a user selects the "Adulthood" category, **When** they view available milestones, **Then** they see options including: Graduation, Wedding, Anniversary, Career Achievement, Parenthood
4. **Given** a user selects any milestone type, **When** they proceed, **Then** the system remembers their selection and shows relevant style options for that milestone

---

### User Story 3 - Manual Style Selection Mode (Priority: P2)

An advanced user wants fine-grained control over which specific styles to generate, rather than using the auto-generation mode. They want to preview style examples, select 1-3 specific styles, and generate only those.

**Why this priority**: Provides power users with control while not being essential for the core experience. Auto-generation serves 80% of users; manual selection serves the remaining 20% who have specific preferences.

**Independent Test**: Can be fully tested by selecting a milestone type, choosing "Manual Style Selection" mode, previewing 3 styles, selecting 2 of them, and generating 8 images (4 per style). Delivers value for users who have specific aesthetic preferences.

**Acceptance Scenarios**:

1. **Given** a user has selected a milestone type and uploaded photos, **When** they choose "Manual Style Selection" mode, **Then** they see a grid of all available styles for that milestone with preview images
2. **Given** a user is in manual selection mode, **When** they tap a style card, **Then** it is visually marked as selected and a counter shows "Selected X/3 styles"
3. **Given** a user has selected 1-3 styles manually, **When** they click "Generate Selected Styles", **Then** the system generates 4 images for each selected style
4. **Given** a user has selected more than 3 styles, **When** they try to select another, **Then** they see a message "Maximum 3 styles - please deselect one first"

---

### User Story 4 - Configurable Style & Prompt Management (Priority: P3)

An administrator or power user wants to add new styles to the system by providing a style name, example image, and text prompt template, without modifying code. They want these new styles to immediately appear as options for the appropriate milestone types.

**Why this priority**: Enables system evolution and customization without developer involvement. Not critical for launch but important for long-term scalability.

**Independent Test**: Can be fully tested by opening a configuration interface, adding a new style "Vintage Film" with prompt "vintage film photography style with grain and warm tones, [SUBJECT]", associating it with "Wedding" milestone, and verifying it appears in the wedding style options. Delivers value by enabling rapid content expansion.

**Acceptance Scenarios**:

1. **Given** an admin accesses the style configuration interface, **When** they click "Add New Style", **Then** they see a form with fields: Style Name, Style Description, Example Image Upload, Prompt Template, Compatible Milestones (multi-select)
2. **Given** an admin has filled out the style form, **When** they save the new style, **Then** it immediately appears in the appropriate milestone categories without requiring app restart
3. **Given** a style configuration exists, **When** an admin edits the prompt template, **Then** subsequent generations use the updated prompt
4. **Given** a style is associated with "Wedding" milestone, **When** a user selects "Wedding" in the app, **Then** they see this style as an available option

---

### User Story 5 - Generated Image Review & Export (Priority: P2)

A user wants to review all generated images in a gallery view, compare different styles side-by-side, favorite their preferred images, and export selected images to their device for sharing on social media or printing.

**Why this priority**: Completes the user journey by enabling them to use the generated images. Essential for user satisfaction but not for the core generation functionality.

**Independent Test**: Can be fully tested by completing an auto-generation, viewing all 15 generated images in a gallery, favoriting 5 images, and exporting them as high-resolution files to the device downloads folder. Delivers value by enabling users to share and preserve their generated photos.

**Acceptance Scenarios**:

1. **Given** images have been generated, **When** the user views the results screen, **Then** they see all images organized in a scrollable gallery grouped by style
2. **Given** a user is viewing the gallery, **When** they tap an image, **Then** it opens in full-screen view with zoom capability and navigation arrows
3. **Given** a user is viewing an image, **When** they tap the heart icon, **Then** it is marked as favorite and appears in a "Favorites" filter tab
4. **Given** a user has selected 1+ favorite images, **When** they click "Export Selected", **Then** the images are saved to the device in original resolution with descriptive filenames (e.g., "Wedding_VintageFilm_001.jpg")
5. **Given** a user wants to share images, **When** they click "Share" on an image, **Then** they see system share options (social media, messaging apps, email)

### Edge Cases

- What happens when the user uploads photos in incompatible formats (e.g., GIF, TIFF)?
  - System should detect format and either auto-convert to JPEG or show a user-friendly error: "Please upload JPEG or PNG images"

- What happens when image generation fails for one style but succeeds for others during auto-generation?
  - System should continue generating remaining styles and show partial results with a note: "X of Y styles completed. [Failed style] encountered an error."

- What happens when the user closes the app during generation?
  - System should save generation progress and allow resuming when the user reopens, showing: "Generation in progress - 6 of 12 images completed. Resume?"

- What happens when two styles have very similar prompts?
  - System should allow this but warn admin during configuration: "This prompt is similar to [Style X]. Verify this is intentional."

- What happens when a user tries to generate with 0 uploaded photos?
  - System should disable the "Generate" button until at least 1 photo is uploaded

- What happens when the user uploads 20+ photos?
  - System should show a warning: "Only the first 5 photos will be used for generation. Please select your best photos."

- What happens when network connectivity is lost during generation?
  - System should detect the failure, cache progress, and show: "Network error. Your progress is saved. Retry when connected?"

- What happens when a user tries to export images but device storage is full?
  - System should detect storage availability and show: "Insufficient storage space. Please free up X MB and try again."

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a comprehensive list of milestone types covering all life stages: Infancy (Birth, Full Month, 100-Day, 1st Birthday), Childhood (birthdays, school events), Adolescence (graduation, coming of age), Adulthood (wedding, career, parenthood), Elderly (anniversaries, retirement, celebrations)

- **FR-002**: System MUST organize milestone types into logical categories by life stage for easy browsing

- **FR-003**: System MUST provide an "Auto-Generation" mode that allows users to generate a complete set of styled images (4 images × 3-5 styles) with a single click

- **FR-004**: System MUST provide a "Manual Selection" mode that allows users to preview and select 1-3 specific styles before generation

- **FR-005**: System MUST generate exactly 4 variations per style to give users variety within a consistent aesthetic

- **FR-006**: System MUST display live progress updates during generation showing current style being processed and estimated time remaining

- **FR-007**: System MUST associate each style with one or more compatible milestone types (e.g., "Romantic Soft Focus" is compatible with Wedding, Anniversary but not with Baby milestones)

- **FR-008**: System MUST store style configurations including: style name, description, example image, prompt template, and compatible milestone types

- **FR-009**: System MUST support dynamic prompt templates with variables (e.g., "[SUBJECT] in [STYLE_DESCRIPTION]") that are replaced at generation time

- **FR-010**: System MUST allow administrators to add, edit, and remove styles through a configuration interface without code changes

- **FR-011**: System MUST validate uploaded photos for format (JPEG, PNG), size (min 512×512px, max 4096×4096px), and file size (max 10MB per photo)

- **FR-012**: System MUST limit photo uploads to 5 photos per generation session

- **FR-013**: System MUST organize generated images by style in the results gallery

- **FR-014**: System MUST allow users to favorite individual generated images

- **FR-015**: System MUST allow users to export selected images in original resolution to device storage

- **FR-016**: System MUST allow users to share images directly to social media and messaging apps

- **FR-017**: System MUST save generation history including milestone type, selected styles, uploaded photos, and generated results

- **FR-018**: System MUST handle partial generation failures gracefully by completing remaining styles and clearly indicating which failed

- **FR-019**: System MUST persist generation progress to allow resuming after app closure or network interruption

- **FR-020**: System MUST provide a default set of at least 3 styles for each milestone category at launch

### Key Entities

- **Milestone Type**: Represents a life event category (e.g., Wedding, 100-Day Baby). Attributes include: unique identifier, display name, description, life stage category, icon, compatible styles list

- **Style**: Represents an artistic style for image generation. Attributes include: unique identifier, style name, description, example image, prompt template, compatible milestone types, creation date, active/inactive status

- **Generation Task**: Represents a single user generation request. Attributes include: unique identifier, user identifier, milestone type, selected styles, uploaded photo references, generation mode (auto/manual), status (pending/in-progress/completed/failed), created timestamp, completed timestamp, progress percentage

- **Generated Image**: Represents a single AI-generated image. Attributes include: unique identifier, parent task identifier, style used, prompt used, generation timestamp, file path, resolution, file size, favorited status, exported status

- **User Session**: Represents a user's interaction session. Attributes include: uploaded photos for current session, selected milestone type, selected styles, generation history

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete an auto-generation flow (select milestone, upload photos, click generate, view results) in under 90 seconds, excluding actual generation time

- **SC-002**: Auto-generation mode produces 12-20 images (4 per style, 3-5 styles) within 60 seconds for typical use cases

- **SC-003**: 80% of users choose auto-generation mode over manual selection mode, validating the "lazy mode" hypothesis

- **SC-004**: System successfully handles generation requests with 0% data loss even when network interruptions occur mid-generation

- **SC-005**: Administrators can add a new style configuration and see it available in the app within 5 minutes without requiring code deployment

- **SC-006**: 90% of generation tasks complete successfully with all requested styles generated

- **SC-007**: Users can export generated images in under 10 seconds per image

- **SC-008**: System correctly validates 100% of invalid image uploads (wrong format, too large, too small) with clear error messages

- **SC-009**: Generated images maintain high visual quality with recognizable subject faces in 95% of cases

- **SC-010**: System supports at least 50 different styles across all milestone categories without performance degradation

## Assumptions

1. **AI Generation Service**: We assume an external AI image generation service (like Gemini) is available and has sufficient quota/capacity to handle user requests

2. **Image Storage**: We assume local device storage is used for caching generated images, with at least 500MB available space per user

3. **Network Connectivity**: We assume users have stable internet connectivity during generation, though the system will handle intermittent failures gracefully

4. **Style Curation**: We assume initial styles are curated by the product team and are culturally appropriate for Chinese life milestones

5. **Prompt Templates**: We assume prompt templates are written in English (for AI service compatibility) even though the UI is in Chinese

6. **Default Styles**: We assume the system launches with at least 15 predefined styles distributed across all milestone categories

7. **Photo Quality**: We assume users upload clear, well-lit photos of faces; the system does not perform photo quality enhancement

8. **Single User Mode**: We assume this is a personal app for individual users, not a shared/family account system

9. **Offline Mode**: We assume generation requires network connectivity; offline mode is not supported in this version

10. **Content Safety**: We assume the AI service has built-in content safety filters and the system does not need additional moderation
