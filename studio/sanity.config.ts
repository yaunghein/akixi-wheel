import {defineConfig} from 'sanity'
import {colorInput} from '@sanity/color-input'
// import {jsonInput} from 'sanity-plugin-json-input'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'Akixi Spin Wheel',

  projectId: '1h6f01om',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), colorInput()],

  schema: {
    types: schemaTypes,
  },
})
