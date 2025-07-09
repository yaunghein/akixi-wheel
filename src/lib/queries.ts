const imageQuery = `
  "url": asset -> url,
  "ratio": asset -> metadata.dimensions.aspectRatio
`;

export const eventQuery = `*[_type == "event" && active == true][0]{
  ...,
  logo {${imageQuery}},
  headerImage {${imageQuery}},
  bgVideo {${imageQuery}},
  segments[]->{
    ...
  }
}`;
