import {defineType, defineField} from 'sanity'

export const submissionType = defineType({
  name: 'submission',
  title: 'Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'event',
      title: 'Event',
      type: 'reference',
      to: [{type: 'wheel'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'first_name',
      title: 'First Name',
      type: 'string',
    }),
    defineField({
      name: 'last_name',
      title: 'Last Name',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'stay_in_touch',
      title: 'Stay in Touch',
      type: 'boolean',
    }),
    defineField({
      name: 'segment',
      title: 'Segment',
      type: 'reference',
      to: [{type: 'segment'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'correct',
      title: 'Correct',
      type: 'boolean',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      first_name: 'first_name',
      last_name: 'last_name',
      email: 'email',
    },
    prepare({first_name, last_name, email}) {
      return {
        title: `${first_name ?? ''} ${last_name ?? ''}`.trim(),
        subtitle: email,
      }
    },
  },
})
