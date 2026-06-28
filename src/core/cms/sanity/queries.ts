const sanityImageProjection = `
  ...,
  asset->{
    _id,
    url,
    metadata {
      dimensions,
      lqip
    }
  }
`;

const globalSectionInlineProjection = `
  title,
  key,
  sectionType,
  content,
  sections[]{
    ...,
    image{
      ${sanityImageProjection}
    },
    backgroundImage{
      ${sanityImageProjection}
    },
    items[]{
      ...,
      image{
        ${sanityImageProjection}
      }
    },
    _type == "sectionForm" => {
      ...,
      form->{
        _id,
        title,
        formType,
        successMessage,
        emailTo,
        fields
      }
    }
  }
`;

const richContentProjection = `
  content[]{
    ...,
    _type == "image" => {
      ${sanityImageProjection}
    },
    _type == "sectionRef" => {
      section->{
        ${globalSectionInlineProjection}
      }
    }
  }
`;

const bannerProjection = `
  banner{
    heading,
    text,
    overlay,
    alignment,
    image{
      ${sanityImageProjection}
    }
  }
`;

export const pageBySlugQuery = `
  *[_type == "page" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    template,
    layout,
    featuredImage{
      ${sanityImageProjection}
    },
    seoImage{
      ${sanityImageProjection}
    },
    ${bannerProjection},
    ${richContentProjection},
    sections[]{
      ...,
      _type == "sectionForm" => {
        ...,
        form->{
          _id,
          title,
          formType,
          successMessage,
          emailTo,
          fields
        }
      },
      _type == "sectionRef" => {
        section->{
          ${globalSectionInlineProjection}
        }
      }
    },
    seo,
    customCode
  }
`;

export const postsQuery = `
  *[_type == "post"] | order(publishedAt desc){
    title,
    "slug": slug.current,
    excerpt,
    featuredImage{
      ${sanityImageProjection}
    },
    archiveImage{
      ${sanityImageProjection}
    },
    ogImage{
      ${sanityImageProjection}
    },
    ${bannerProjection},
    ${richContentProjection},
    publishedAt,
    categories,
    tags,
    author->{
  name,
  "slug": slug.current,
  role,
  bio,
  email,
  website,
  linkedin,
  twitter,
  github,
  photo{
    ...,
    asset->{
      url,
      metadata{
        dimensions
      }
    }
  }
},
    seo,
    customCode
  }
`;

export const postBySlugQuery = `
  *[_type == "post" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    excerpt,
    featuredImage{
      ${sanityImageProjection}
    },
    archiveImage{
      ${sanityImageProjection}
    },
    ogImage{
      ${sanityImageProjection}
    },
    ${bannerProjection},
    ${richContentProjection},
    publishedAt,
    categories,
    tags,
    author->{
  name,
  "slug": slug.current,
  role,
  bio,
  email,
  website,
  linkedin,
  twitter,
  github,
  photo{
    ...,
    asset->{
      url,
      metadata{
        dimensions
      }
    }
  }
},
    seo,
    customCode
  }
`;

export const menuByNameQuery = `
  *[_type == "menu" && name == $name][0]{
    name,
    items[]{
      label,
      url,
      itemType,
      description,
      icon,
      cssClass,
      targetBlank,
      isMegaMenu,
      megaMenuColumns,
      page->{ title, "slug": slug.current },
      post->{ title, "slug": slug.current },
      teamMember->{ name, "slug": slug.current },
      category,
      tag,
      children[]{
        label,
        url,
        itemType,
        description,
        icon,
        cssClass,
        targetBlank,
        page->{ title, "slug": slug.current },
        post->{ title, "slug": slug.current },
        teamMember->{ name, "slug": slug.current },
        category,
        tag
      }
    }
  }
`;

export const siteSettingsQuery = `
  *[_type == "siteSettings"][0]{
    siteTitle,
    tagline,
    logo{
      ${sanityImageProjection}
    },
    favicon{
      ${sanityImageProjection}
    },
    phone,
    email,
    address,
    social,
    customCode
  }
`;

export const themeSettingsQuery = `
  *[_type == "themeSettings"][0]{
    primaryColor,
    secondaryColor,
    backgroundColor,
    textColor,
    tokens{
      colors{
        primary,
        secondary,
        background,
        text,
        muted,
        border,
        softBackground
      },
      spacing{
        xs,
        sm,
        md,
        lg,
        xl,
        xxl
      },
      radius{
        sm,
        md,
        lg,
        full
      },
      containerWidth,
      breakpoints{
        sm,
        md,
        lg,
        xl
      }
    },
    typography{
      fontFamily,
      headingFontFamily
    },
    containerWidth,
    buttonStyle,
    header{
      sticky,
      showTopBar,
      showCta,
      ctaLabel,
      ctaUrl
    },
    footer{
      showFooterWidgets,
      copyrightText
    }
  }
`;

export const widgetsByAreaQuery = `
  *[_type == "widget" && area == $area] | order(order asc){
    "id": _id,
    area,
    type,
    title,
    content,
    menuName,
    buttonLabel,
    buttonUrl
  }
`;

export const globalSectionsQuery = `
  *[_type == "globalSection"]{
    title,
    key,
    sectionType,
    content
  }
`;

export const searchQuery = `
{
  "pages": *[
    _type == "page" &&
    (
      title match $query + "*" ||
      slug.current match $query + "*"
    )
  ]{
    _id,
    title,
    "slug": slug.current
  },

  "posts": *[
    _type == "post" &&
    (
      title match $query + "*" ||
      excerpt match $query + "*"
    )
  ]{
    _id,
    title,
    excerpt,
    "slug": slug.current
  },

  "team": *[
    _type == "teamMember" &&
    (
      name match $query + "*" ||
      role match $query + "*" ||
      bio match $query + "*"
    )
  ]{
    _id,
    "title": name,
    "slug": slug.current,
    "excerpt": role
  },

  "testimonials": *[
    _type == "globalSection" &&
    sectionType == "testimonials"
  ]{
    _id,
    "title": title,
    "excerpt": ""
  },

  "services": *[
    _type == "globalSection" &&
    sectionType == "services"
  ]{
    _id,
    "title": title,
    "excerpt": ""
  }
}
`;




export const relatedPostsQuery = `
  *[
    _type == "post" &&
    slug.current != $slug &&
    (
      count((categories[])[@ in $categories]) > 0 ||
      count((tags[])[@ in $tags]) > 0
    )
  ] | order(publishedAt desc)[0...$limit]{
    _id,
    title,
    excerpt,
    "slug": slug.current
  }
`;

export const teamMemberBySlugQuery = `
  *[_type == "teamMember" && slug.current == $slug][0]{
    name,
    "slug": slug.current,
    role,
    bio,
    email,
    website,
    linkedin,
    twitter,
    github,
    photo{
      ...,
      asset->{
        url,
        metadata{
          dimensions
        }
      }
    }
  }
`;

export const teamMembersQuery = `
  *[_type == "teamMember"] | order(name asc){
    name,
    "slug": slug.current,
    role,
    bio,
    email,
    website,
    linkedin,
    twitter,
    github,
    photo{
      ...,
      asset->{
        url,
        metadata{
          dimensions
        }
      }
    }
  }
`;

export const postsByTeamMemberQuery = `
  *[_type == "post" && author->slug.current == $slug] | order(publishedAt desc){
    title,
    "slug": slug.current,
    excerpt,
    featuredImage{
      ${sanityImageProjection}
    },
    archiveImage{
      ${sanityImageProjection}
    },
    ogImage{
      ${sanityImageProjection}
    },
    ${bannerProjection},
    ${richContentProjection},
    publishedAt,
    categories,
    tags,

    author->{
      name,
      "slug": slug.current,
      role,
      bio,
      email,
      website,
      linkedin,
      twitter,
      github,
      photo{
        ...,
        asset->{
          url,
          metadata{
            dimensions
          }
        }
      }
    },

    seo,
    customCode
  }
`;
