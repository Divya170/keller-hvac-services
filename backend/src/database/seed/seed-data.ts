import type { ContentSectionKey } from '../../common/constants/domain';

/** Content from the approved prototype. `confirmed: false` marks the prototype's "pending confirmation" drafts. */
export interface SeedItem {
  title: string;
  body?: string;
  confirmed?: boolean;
}

export const SEED_CONTENT: Record<ContentSectionKey, SeedItem[]> = {
  home_expect: [
    { title: 'Clear communication', body: 'Your request is read by the team, and any follow-up questions are asked before a visit is arranged.', confirmed: false },
    { title: 'Practical information', body: 'Explanations of what was found and what the options are, in plain language.', confirmed: false },
    { title: 'A proper system assessment', body: 'Recommendations based on the equipment you have and the problem you describe.', confirmed: false },
  ],
  home_steps: [
    { title: 'Describe your HVAC issue', body: 'Tell us what the system is doing and what kind of equipment you have.' },
    { title: 'Provide contact and property details', body: 'So the team knows where the system is and how to reach you.' },
    { title: 'Submit your request', body: 'Your enquiry is recorded. It is not a confirmed booking.' },
    { title: 'Receive follow-up', body: 'The team contacts you once your enquiry has been reviewed.' },
  ],
  ac_services: [
    { title: 'Troubleshooting', body: 'Finding out why the system is not cooling, short-cycling, leaking or making noise.' },
    { title: 'AC repair', body: 'Repairs to existing air-conditioning equipment once the problem has been assessed.' },
    { title: 'Installation and replacement', body: 'Planning new cooling equipment or replacing an existing unit.' },
    { title: 'Maintenance', body: 'Routine servicing of cooling equipment. Listed only if confirmed by the business.', confirmed: false },
  ],
  heating_services: [
    { title: 'Heating repair', body: 'For systems not producing heat, cycling on and off, or not responding to the thermostat.' },
    { title: 'Installation', body: 'Planning new heating equipment for a home or commercial property.' },
    { title: 'Replacement', body: 'Replacing an existing heating system that is no longer reliable.' },
    { title: 'Maintenance', body: 'Routine heating servicing. Listed only if confirmed by the business.', confirmed: false },
  ],
  install_items: [{ title: 'New heating or cooling equipment' }, { title: 'Replacing an existing system' }, { title: 'Thermostat and control upgrades' }],
  repair_items: [{ title: 'System not turning on' }, { title: 'Not heating or cooling enough' }, { title: 'Unusual noises, smells or leaks' }],
  include_list: [
    { title: 'What the system is doing, and when it started.' },
    { title: 'The type of equipment, if you know it — or a photo of the unit label.' },
    { title: 'Whether the property is residential or commercial, and where it is.' },
    { title: 'For installations: what you have now and what you would like to change.' },
  ],
  faqs: [
    {
      title: 'Does submitting a request book an appointment?',
      body: 'No. The online form sends an enquiry. The team reviews it and contacts you to discuss next steps and confirm any appointment.',
    },
    {
      title: 'What should I include in my request?',
      body: 'Describe what the system is doing, when it started, and any noises, smells, error codes or recent changes. A photo of the unit and its label can help.',
    },
    { title: 'Can I call instead?', body: 'Yes. Call {{phone}} or email {{email}}.' },
  ],
  privacy: [
    {
      title: 'What we collect',
      body: 'When you submit a service request we collect your name, phone number, email address, property type and location, details about your HVAC equipment and issue, your appointment preference, and any photos you choose to attach.',
    },
    {
      title: 'How it is used',
      body: 'This information is used to review and respond to your enquiry. Uploaded photos are stored privately and are only accessible to the business.',
    },
  ],
};
