import { Advertisement } from './models/Advertisement.model'

export const advertisementProviders = [
  {
    provide: 'ADVERTISEMENT_REPOSITORY',
    useValue: Advertisement,
  },
];