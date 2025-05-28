import { ContactForm } from './models/contactForm.model';

export const contactFormProviders = [
  {
    provide: 'CONTACT_FORM_REPOSITORY',
    useValue: ContactForm,
  },
];