import { ChecklistTemplate } from '../types';
import { CanvasElement } from '../../../../types';

export const checklistTemplates: ChecklistTemplate[] = [
  // 1. Simple Row Checklist with Circles (Screenshot 2 Top & Screenshot 4)
  {
    id: 'customer-feedback-checklist',
    title: 'Customer Service Review Checklist',
    width: 380,
    height: 180,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 180" width="380" height="180">
        <!-- Outer Box & Border -->
        <rect x="2" y="2" width="376" height="176" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <!-- Horizontal Row Dividers -->
        <line x1="2" y1="46" x2="378" y2="46" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="90" x2="378" y2="90" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="134" x2="378" y2="134" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="48" y1="2" x2="48" y2="178" stroke="#F1F5F9" stroke-width="1"/>
        
        <!-- Row 1: Unchecked Solid Circle -->
        <circle cx="26" cy="24" r="7" fill="#CBD5E1"/>
        <text x="56" y="28" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#334155">Review customer feedback and address any concerns.</text>

        <!-- Row 2: Checked Circle -->
        <circle cx="26" cy="68" r="7.5" fill="#E2E8F0"/>
        <path d="M 22 68 L 25 71 L 30 65" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="56" y="72" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#334155">Respond to inquiries, complaints, or reviews promptly.</text>

        <!-- Row 3: Checked Circle -->
        <circle cx="26" cy="112" r="7.5" fill="#E2E8F0"/>
        <path d="M 22 112 L 25 115 L 30 109" fill="none" stroke="#475569" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="56" y="116" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#334155">Implement strategies to improve customer satisfaction.</text>

        <!-- Row 4: Unchecked Solid Circle -->
        <circle cx="26" cy="156" r="7" fill="#CBD5E1"/>
        <text x="56" y="160" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#334155">Identify opportunities for building customer loyalty.</text>
      </svg>
    `,
    getCanvasElements: (groupId): CanvasElement[] => [
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'checklist',
        x: 60,
        y: 80,
        width: 380,
        height: 180,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        groupId,
        checklistData: {
          themeId: 'customer-feedback-checklist',
          title: 'Customer Service Review',
          borderColor: '#CBD5E1',
          cardBg: '#FFFFFF',
          fontSize: 11,
          textColor: '#334155',
          rows: [
            { id: 'r1', text: 'Review customer feedback and address any concerns.', checked: false },
            { id: 'r2', text: 'Respond to inquiries, complaints, or reviews promptly.', checked: true },
            { id: 'r3', text: 'Implement strategies to improve customer satisfaction.', checked: true },
            { id: 'r4', text: 'Identify opportunities for building customer loyalty.', checked: false },
          ],
        },
      },
    ],
  },

  // 2. Lesson Planning Checklist (Screenshot 2, Item 2)
  {
    id: 'lesson-planning-checklist',
    title: 'Lesson Planning Checklist',
    width: 360,
    height: 140,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 140" width="360" height="140">
        <!-- Title -->
        <text x="180" y="32" font-family="Montserrat, sans-serif" font-size="16" font-weight="900" fill="#0F172A" text-anchor="middle" letter-spacing="-0.3">Lesson Planning Checklist</text>
        
        <!-- Item 1: Soft Teal Square -->
        <rect x="25" y="52" width="18" height="18" rx="3" fill="#BCE3DF"/>
        <text x="56" y="66" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#334155">Create and review lesson plans for the week.</text>

        <!-- Item 2: Checked Teal Square -->
        <rect x="25" y="90" width="18" height="18" rx="3" fill="#A7DCD7"/>
        <path d="M 29 99 L 33 103 L 39 94" fill="none" stroke="#2D6A65" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="56" y="104" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#334155">Align lessons with curriculum standards.</text>
      </svg>
    `,
    getCanvasElements: (groupId): CanvasElement[] => [
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'checklist',
        x: 60,
        y: 80,
        width: 360,
        height: 140,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        groupId,
        checklistData: {
          themeId: 'lesson-planning-checklist',
          title: 'Lesson Planning Checklist',
          checkboxColor: '#A7DCD7',
          cardBg: '#FFFFFF',
          fontSize: 12,
          textColor: '#334155',
          rows: [
            { id: 'r1', text: 'Create and review lesson plans for the week.', checked: false },
            { id: 'r2', text: 'Align lessons with curriculum standards.', checked: true },
          ],
        },
      },
    ],
  },

  // 3. Employee Development Progress (Screenshot 2, Item 3)
  {
    id: 'employee-development-progress',
    title: 'Employee Development Progress Table',
    width: 380,
    height: 140,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 140" width="380" height="140">
        <!-- Header Bar -->
        <rect x="2" y="2" width="376" height="34" rx="2" fill="#132B50"/>
        <text x="14" y="24" font-family="Montserrat, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF">Employee Development Progress</text>
        <line x1="280" y1="2" x2="280" y2="36" stroke="#2A436D" stroke-width="1.5"/>
        <text x="328" y="24" font-family="Montserrat, sans-serif" font-size="12" font-weight="800" fill="#FFFFFF" text-anchor="middle">Done</text>

        <!-- Outer Box and Grid Lines -->
        <rect x="2" y="36" width="376" height="98" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/>
        <line x1="2" y1="84" x2="378" y2="84" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="280" y1="36" x2="280" y2="134" stroke="#CBD5E1" stroke-width="1.2"/>

        <!-- Row 1: Text and Checked Blue Circle -->
        <text x="14" y="64" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#1E293B">All employees have received coaching</text>
        <circle cx="328" cy="60" r="10" fill="#1B3A68"/>
        <path d="M 323 60 L 327 64 L 333 56" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

        <!-- Row 2: Text and Filled Blue Circle -->
        <text x="14" y="112" font-family="Inter, sans-serif" font-size="11.5" font-weight="600" fill="#1E293B">Development plans implemented</text>
        <circle cx="328" cy="108" r="10" fill="#1B3A68"/>
      </svg>
    `,
    getCanvasElements: (groupId): CanvasElement[] => [
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'checklist',
        x: 60,
        y: 80,
        width: 380,
        height: 140,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        groupId,
        checklistData: {
          themeId: 'employee-development-progress',
          title: 'Employee Development Progress',
          columns: ['Done'],
          headerBg: '#132B50',
          headerTextColor: '#FFFFFF',
          checkboxColor: '#1B3A68',
          borderColor: '#CBD5E1',
          cardBg: '#FFFFFF',
          fontSize: 11.5,
          textColor: '#1E293B',
          rows: [
            { id: 'r1', text: 'All employees have received coaching', checked: true },
            { id: 'r2', text: 'Development plans implemented', checked: false },
          ],
        },
      },
    ],
  },

  // 4. Recruitment & Hiring To-Do Checklist (Screenshot 2, Item 4)
  {
    id: 'recruitment-hiring-checklist',
    title: 'Recruitment & Hiring Checklist',
    width: 360,
    height: 160,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 160" width="360" height="160">
        <!-- Centered Bold Title -->
        <text x="180" y="28" font-family="Montserrat, sans-serif" font-size="15" font-weight="900" fill="#0F172A" text-anchor="middle">Recruitment &amp; Hiring To-Do Checklist</text>

        <!-- Item 1 -->
        <circle cx="34" cy="58" r="8" fill="#FFFFFF" stroke="#334155" stroke-width="1.5"/>
        <path d="M 30 58 L 33 61 L 38 54" fill="none" stroke="#334155" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="56" y="62" font-family="Inter, sans-serif" font-size="11.5" font-weight="500" fill="#334155">Post job openings on internal and external platforms.</text>

        <!-- Item 2 -->
        <circle cx="34" cy="94" r="8" fill="#FFFFFF" stroke="#334155" stroke-width="1.5"/>
        <path d="M 30 94 L 33 97 L 38 90" fill="none" stroke="#334155" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="56" y="98" font-family="Inter, sans-serif" font-size="11.5" font-weight="500" fill="#334155">Screen and review resumes and applications.</text>

        <!-- Item 3 -->
        <circle cx="34" cy="130" r="8" fill="#FFFFFF" stroke="#334155" stroke-width="1.5"/>
        <path d="M 30 130 L 33 133 L 38 126" fill="none" stroke="#334155" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <text x="56" y="134" font-family="Inter, sans-serif" font-size="11.5" font-weight="500" fill="#334155">Schedule and conduct interviews with candidates.</text>
      </svg>
    `,
    getCanvasElements: (groupId): CanvasElement[] => [
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'checklist',
        x: 60,
        y: 80,
        width: 360,
        height: 160,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        groupId,
        checklistData: {
          themeId: 'recruitment-hiring-checklist',
          title: 'Recruitment & Hiring To-Do Checklist',
          checkboxColor: '#334155',
          fontSize: 11.5,
          textColor: '#334155',
          rows: [
            { id: 'r1', text: 'Post job openings on internal and external platforms.', checked: true },
            { id: 'r2', text: 'Screen and review resumes and applications.', checked: true },
            { id: 'r3', text: 'Schedule and conduct interviews with candidates.', checked: true },
          ],
        },
      },
    ],
  },

  // 5. Multi-Section Color Band Meeting Checklist (Screenshot 2, Item 5)
  {
    id: 'color-band-process-checklist',
    title: 'Color Band Meeting & Action Checklist',
    width: 390,
    height: 200,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 190" width="390" height="190">
        <!-- Section 1 Header (Blue) -->
        <rect x="2" y="2" width="386" height="18" fill="#38BDF8" rx="2"/>
        <text x="10" y="15" font-family="Montserrat, sans-serif" font-size="9" font-weight="800" fill="#0F172A">Feedback and Development</text>
        <rect x="2" y="20" width="386" height="38" fill="#FFFFFF" stroke="#E2E8F0"/>
        <rect x="14" y="24" width="10" height="10" rx="1" fill="none" stroke="#64748B"/>
        <text x="32" y="32" font-family="Inter, sans-serif" font-size="7.5" font-weight="500" fill="#334155">Marketing campaign feedback and improvements: communication with roadblocks and challenges</text>
        <rect x="14" y="42" width="10" height="10" rx="1" fill="none" stroke="#64748B"/>
        <text x="32" y="50" font-family="Inter, sans-serif" font-size="7.5" font-weight="500" fill="#334155">Career Development opportunity: leadership training and data analysis workshop (Excel and Data visualization tools)</text>

        <!-- Section 2 Header (Teal) -->
        <rect x="2" y="64" width="386" height="18" fill="#2DD4BF" rx="2"/>
        <text x="10" y="77" font-family="Montserrat, sans-serif" font-size="9" font-weight="800" fill="#0F172A">Future Planning and Goal Setting</text>
        <rect x="2" y="82" width="386" height="38" fill="#FFFFFF" stroke="#E2E8F0"/>
        <rect x="14" y="86" width="10" height="10" rx="1" fill="none" stroke="#64748B"/>
        <text x="32" y="94" font-family="Inter, sans-serif" font-size="7.5" font-weight="500" fill="#334155">Upcoming Q3 project: website redesign</text>
        <rect x="14" y="104" width="10" height="10" rx="1" fill="none" stroke="#64748B"/>
        <text x="32" y="112" font-family="Inter, sans-serif" font-size="7.5" font-weight="500" fill="#334155">Priorities / milestones with stakeholders</text>

        <!-- Section 3 Header (Green) -->
        <rect x="2" y="126" width="386" height="18" fill="#84CC16" rx="2"/>
        <text x="10" y="139" font-family="Montserrat, sans-serif" font-size="9" font-weight="800" fill="#0F172A">Open Discussion and Wrap-up</text>
        <rect x="2" y="144" width="386" height="38" fill="#FFFFFF" stroke="#E2E8F0"/>
        <rect x="14" y="148" width="10" height="10" rx="1" fill="none" stroke="#64748B"/>
        <text x="32" y="156" font-family="Inter, sans-serif" font-size="7.5" font-weight="500" fill="#334155">Questions: remote work policy?</text>
        <rect x="14" y="166" width="10" height="10" rx="1" fill="none" stroke="#64748B"/>
        <text x="32" y="174" font-family="Inter, sans-serif" font-size="7.5" font-weight="500" fill="#334155">Finalize vendor issue, lead website workshop/sharing. Next meeting August 15th at 10:00AM</text>
      </svg>
    `,
    getCanvasElements: (groupId): CanvasElement[] => [
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'checklist',
        x: 60,
        y: 80,
        width: 390,
        height: 200,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        groupId,
        checklistData: {
          themeId: 'color-band-process-checklist',
          fontSize: 9,
          textColor: '#334155',
          sections: [
            { id: 's1', title: 'Feedback and Development', color: '#38BDF8' },
            { id: 's2', title: 'Future Planning and Goal Setting', color: '#2DD4BF' },
            { id: 's3', title: 'Open Discussion and Wrap-up', color: '#84CC16' },
          ],
          rows: [
            { id: 'r1', text: 'Marketing campaign feedback: communication with roadblocks and challenges', checked: false, section: 's1' },
            { id: 'r2', text: 'Career Development: leadership training and data analysis workshop', checked: false, section: 's1' },
            { id: 'r3', text: 'Upcoming Q3 project: website redesign', checked: false, section: 's2' },
            { id: 'r4', text: 'Priorities / milestones with stakeholders', checked: false, section: 's2' },
            { id: 'r5', text: 'Questions: remote work policy?', checked: false, section: 's3' },
            { id: 'r6', text: 'Finalize vendor issue. Next meeting August 15th at 10:00AM', checked: false, section: 's3' },
          ],
        },
      },
    ],
  },

  // 6. Goals Progress Matrix Table (Screenshot 2, Item 6 & Screenshot 3, Top)
  {
    id: 'goals-matrix-checklist',
    title: 'Goals Progress Matrix Table',
    width: 380,
    height: 190,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 190" width="380" height="190">
        <!-- Header Row (Periwinkle Blue) -->
        <rect x="2" y="2" width="376" height="28" fill="#BDD3F5" stroke="#93B4E4" stroke-width="1"/>
        <text x="12" y="20" font-family="Montserrat, sans-serif" font-size="11" font-weight="900" fill="#0F172A">Goals</text>
        
        <line x1="220" y1="2" x2="220" y2="188" stroke="#93B4E4" stroke-width="1"/>
        <text x="258" y="20" font-family="Montserrat, sans-serif" font-size="10" font-weight="800" fill="#0F172A" text-anchor="middle">In Progress</text>

        <line x1="298" y1="2" x2="298" y2="188" stroke="#93B4E4" stroke-width="1"/>
        <text x="338" y="20" font-family="Montserrat, sans-serif" font-size="10" font-weight="800" fill="#0F172A" text-anchor="middle">Completed</text>

        <!-- Outer Box & Grid Lines -->
        <rect x="2" y="30" width="376" height="158" fill="#FFFFFF" stroke="#93B4E4" stroke-width="1"/>
        <line x1="2" y1="62" x2="378" y2="62" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="94" x2="378" y2="94" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="126" x2="378" y2="126" stroke="#E2E8F0" stroke-width="1"/>
        <line x1="2" y1="158" x2="378" y2="158" stroke="#E2E8F0" stroke-width="1"/>

        <!-- Row 1 -->
        <text x="12" y="50" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#334155">Improve Customer Service Skills</text>
        <rect x="250" y="40" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>
        <rect x="330" y="40" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>

        <!-- Row 2 -->
        <text x="12" y="82" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#334155">Increase Sales by 20%</text>
        <rect x="250" y="72" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>
        <rect x="330" y="72" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>

        <!-- Row 3 -->
        <text x="12" y="114" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#334155">Enhance Team Collaboration</text>
        <rect x="250" y="104" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>
        <rect x="330" y="104" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>

        <!-- Row 4 -->
        <text x="12" y="146" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#334155">Reduce Project Turnaround Time</text>
        <rect x="250" y="136" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>
        <rect x="330" y="136" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>

        <!-- Row 5 -->
        <text x="12" y="178" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="#334155">Develop Leadership Skills</text>
        <rect x="250" y="168" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>
        <rect x="330" y="168" width="16" height="16" rx="4" fill="none" stroke="#64748B" stroke-width="1.2"/>
      </svg>
    `,
    getCanvasElements: (groupId): CanvasElement[] => [
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'checklist',
        x: 60,
        y: 80,
        width: 380,
        height: 190,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        groupId,
        checklistData: {
          themeId: 'goals-matrix-checklist',
          title: 'Goals',
          columns: ['In Progress', 'Completed'],
          headerBg: '#BDD3F5',
          headerTextColor: '#0F172A',
          borderColor: '#93B4E4',
          cardBg: '#FFFFFF',
          fontSize: 10.5,
          textColor: '#334155',
          rows: [
            { id: 'r1', text: 'Improve Customer Service Skills', checked: false, columnValues: { 'In Progress': false, 'Completed': false } },
            { id: 'r2', text: 'Increase Sales by 20%', checked: false, columnValues: { 'In Progress': false, 'Completed': false } },
            { id: 'r3', text: 'Enhance Team Collaboration', checked: false, columnValues: { 'In Progress': false, 'Completed': false } },
            { id: 'r4', text: 'Reduce Project Turnaround Time', checked: false, columnValues: { 'In Progress': false, 'Completed': false } },
            { id: 'r5', text: 'Develop Leadership Skills', checked: false, columnValues: { 'In Progress': false, 'Completed': false } },
          ],
        },
      },
    ],
  },

  // 7. Task List with Gold Banner & Alternating Rows (Screenshot 3, Bottom)
  {
    id: 'gold-task-list-checklist',
    title: 'Task List with Amber Banner',
    width: 380,
    height: 220,
    getSvg: () => `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 220" width="380" height="220">
        <!-- Gold / Amber Header -->
        <rect x="25" y="6" width="330" height="28" rx="2" fill="#E58E26"/>
        <text x="190" y="25" font-family="Montserrat, sans-serif" font-size="14" font-weight="900" fill="#1C1917" text-anchor="middle" letter-spacing="0.5">Task List:</text>

        <!-- Row 1 (White) -->
        <rect x="42" y="40" width="13" height="13" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>
        <text x="64" y="50" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#334155">Prepare status updates and highlight any areas of exceptional performance.</text>

        <!-- Row 2 (Soft Amber Highlight) -->
        <rect x="25" y="62" width="330" height="22" rx="2" fill="#FFE8CC"/>
        <rect x="42" y="66.5" width="13" height="13" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>
        <text x="64" y="77" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#334155">Complete the Q3 campaign with a 20% increase in engagement.</text>

        <!-- Row 3 (White) -->
        <rect x="42" y="93" width="13" height="13" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>
        <text x="64" y="103" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#334155">Facing delays in the new product launch due to supply chain issues.</text>

        <!-- Row 4 (Soft Amber Highlight) -->
        <rect x="25" y="115" width="330" height="22" rx="2" fill="#FFE8CC"/>
        <rect x="42" y="119.5" width="13" height="13" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>
        <text x="64" y="130" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#334155">Discuss feedback from peers, clients, or other departments.</text>

        <!-- Row 5 (White) -->
        <rect x="42" y="146" width="13" height="13" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>
        <text x="64" y="156" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#334155">Need to improve data analytics skills to better interpret marketing metrics.</text>

        <!-- Row 6 (Soft Amber Highlight) -->
        <rect x="25" y="168" width="330" height="22" rx="2" fill="#FFE8CC"/>
        <rect x="42" y="172.5" width="13" height="13" rx="2.5" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.3"/>
        <text x="64" y="183" font-family="Inter, sans-serif" font-size="8.5" font-weight="500" fill="#334155">Enroll in an advanced Google Analytics course.</text>
      </svg>
    `,
    getCanvasElements: (groupId): CanvasElement[] => [
      {
        id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: 'checklist',
        x: 60,
        y: 80,
        width: 380,
        height: 220,
        rotation: 0,
        opacity: 1,
        zIndex: 10,
        groupId,
        checklistData: {
          themeId: 'gold-task-list-checklist',
          title: 'Task List:',
          headerBg: '#E58E26',
          headerTextColor: '#1C1917',
          alternateRowBg: '#FFE8CC',
          cardBg: '#FFFFFF',
          fontSize: 9.5,
          textColor: '#334155',
          rows: [
            { id: 'r1', text: 'Prepare status updates and highlight any areas of exceptional performance.', checked: false },
            { id: 'r2', text: 'Complete the Q3 campaign with a 20% increase in engagement.', checked: false },
            { id: 'r3', text: 'Facing delays in the new product launch due to supply chain issues.', checked: false },
            { id: 'r4', text: 'Discuss feedback from peers, clients, or other departments.', checked: false },
            { id: 'r5', text: 'Need to improve data analytics skills to better interpret marketing metrics.', checked: false },
            { id: 'r6', text: 'Enroll in an advanced Google Analytics course.', checked: false },
          ],
        },
      },
    ],
  },
];
