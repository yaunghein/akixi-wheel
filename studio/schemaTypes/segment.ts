// segment.ts
import {defineType, defineField} from 'sanity'

export const segmentType = defineType({
  name: 'segment',
  title: 'Segment',
  type: 'document',
  fields: [
    defineField({
      name: 'text',
      title: 'Segment Text',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'color',
      title: 'Color',
      type: 'color',
    }),
    defineField({
      name: 'question',
      title: 'Question',
      type: 'object',
      fields: [
        {
          name: 'text',
          title: 'Question Text',
          type: 'string',
        },
        {
          name: 'choices',
          title: 'Choices',
          type: 'array',
          of: [{type: 'string'}],
          validation: (Rule) => Rule.min(2).max(3),
        },
        {
          name: 'correct',
          title: 'Correct Answer (A/B/C)',
          type: 'string',
          validation: (Rule) =>
            Rule.required().custom((value: string) => {
              const allowed = ['A', 'B', 'C']
              return allowed.includes(value) ? true : 'Must be one of A, B, or C'
            }),
        },
        // {
        //   name: 'explanation',
        //   title: 'Explanation',
        //   type: 'text',
        // },
      ],
    }),
  ],
})
