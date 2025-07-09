export const eventQuery = `*[_type == "event" && active == true][0]{
  ...,
  segments[]->{
    ...
  }
}`;
