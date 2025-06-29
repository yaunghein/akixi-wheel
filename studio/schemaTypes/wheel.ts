import {defineType, defineField} from 'sanity'

export const wheelType = defineType({
  name: 'wheel',
  title: 'Wheel',
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
          type: 'object',
          name: 'segment',
          fields: [
            {
              name: 'text',
              title: 'Segment Text',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'color',
              title: 'Color',
              type: 'color',
            },
            {
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
                {
                  name: 'explanation',
                  title: 'Explanation',
                  type: 'text',
                },
              ],
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(7).max(7).error('Exactly 7 segments required'),
    }),
  ],
})
