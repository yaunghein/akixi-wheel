import {defineType, defineField} from 'sanity'

export const submissionType = defineType({
  name: 'submission',
  title: 'Submission',
  type: 'document',
  fields: [
    defineField({
      name: 'first_name',
      title: 'First Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'last_name',
      title: 'Last Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (Rule) => Rule.required().email(),
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
    }),
    defineField({
      name: 'correct',
      title: 'Correct',
      type: 'boolean',
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
