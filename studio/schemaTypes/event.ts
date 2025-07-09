import {defineType, defineField} from 'sanity'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'segments',
      title: 'Segments',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'segment'}],
        },
      ],
      validation: (Rule) => Rule.required().min(7).max(7).error('Exactly 7 segments required'),
    }),
  ],
})
