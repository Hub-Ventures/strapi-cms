import type { Schema, Struct } from '@strapi/strapi';

export interface BlocksCta extends Struct.ComponentSchema {
  collectionName: 'components_blocks_ctas';
  info: {
    description: 'Call-to-action section with button';
    displayName: 'CTA';
    icon: 'cursor';
  };
  attributes: {
    button_text: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    button_url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    style: Schema.Attribute.Enumeration<['primary', 'secondary', 'outline']> &
      Schema.Attribute.DefaultTo<'primary'>;
    variant: Schema.Attribute.Enumeration<['banner', 'card', 'inline']> &
      Schema.Attribute.DefaultTo<'banner'>;
  };
}

export interface BlocksFaq extends Struct.ComponentSchema {
  collectionName: 'components_blocks_faqs';
  info: {
    description: 'Frequently asked questions section';
    displayName: 'FAQ';
    icon: 'question';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.faq-item', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    variant: Schema.Attribute.Enumeration<
      ['accordion', 'list', 'two-columns']
    > &
      Schema.Attribute.DefaultTo<'accordion'>;
  };
}

export interface BlocksFeatures extends Struct.ComponentSchema {
  collectionName: 'components_blocks_features';
  info: {
    description: 'Feature highlights section';
    displayName: 'Features';
    icon: 'star';
  };
  attributes: {
    items: Schema.Attribute.Component<'shared.feature-item', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    variant: Schema.Attribute.Enumeration<['grid', 'list', 'alternating']> &
      Schema.Attribute.DefaultTo<'grid'>;
  };
}

export interface BlocksFooter extends Struct.ComponentSchema {
  collectionName: 'components_blocks_footers';
  info: {
    description: 'Page footer section with social links';
    displayName: 'Footer';
    icon: 'apps';
  };
  attributes: {
    copyright: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    social_facebook: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    social_instagram: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    social_linkedin: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    social_twitter: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    variant: Schema.Attribute.Enumeration<['simple', 'columns', 'minimal']> &
      Schema.Attribute.DefaultTo<'simple'>;
  };
}

export interface BlocksHero extends Struct.ComponentSchema {
  collectionName: 'components_blocks_heroes';
  info: {
    description: 'Hero banner section with call-to-action';
    displayName: 'Hero';
    icon: 'landscape';
  };
  attributes: {
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'center'>;
    background_image: Schema.Attribute.Media<'images'>;
    cta_text: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    cta_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    subtitle: Schema.Attribute.Text;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    variant: Schema.Attribute.Enumeration<
      ['centered', 'split', 'image-left', 'image-right']
    > &
      Schema.Attribute.DefaultTo<'centered'>;
  };
}

export interface BlocksImageGrid extends Struct.ComponentSchema {
  collectionName: 'components_blocks_image_grids';
  info: {
    description: 'Multi-image gallery section';
    displayName: 'Image Grid';
    icon: 'picture';
  };
  attributes: {
    caption: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
    columns: Schema.Attribute.Enumeration<['2', '3', '4']> &
      Schema.Attribute.DefaultTo<'3'>;
    images: Schema.Attribute.Media<'images', true> & Schema.Attribute.Required;
    variant: Schema.Attribute.Enumeration<['grid', 'masonry', 'carousel']> &
      Schema.Attribute.DefaultTo<'grid'>;
  };
}

export interface BlocksSpacer extends Struct.ComponentSchema {
  collectionName: 'components_blocks_spacers';
  info: {
    description: 'Vertical spacing utility block';
    displayName: 'Spacer';
    icon: 'arrowDown';
  };
  attributes: {
    height: Schema.Attribute.Enumeration<
      ['small', 'medium', 'large', 'extra-large']
    > &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'medium'>;
  };
}

export interface BlocksStats extends Struct.ComponentSchema {
  collectionName: 'components_blocks_stats';
  info: {
    description: 'Statistics showcase section';
    displayName: 'Stats';
    icon: 'chartBubble';
  };
  attributes: {
    statistics: Schema.Attribute.Component<'shared.stat-item', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    variant: Schema.Attribute.Enumeration<['horizontal', 'vertical', 'card']> &
      Schema.Attribute.DefaultTo<'horizontal'>;
  };
}

export interface BlocksTeam extends Struct.ComponentSchema {
  collectionName: 'components_blocks_teams';
  info: {
    description: 'Team members showcase section';
    displayName: 'Team';
    icon: 'user';
  };
  attributes: {
    members: Schema.Attribute.Component<'shared.team-member', true> &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    variant: Schema.Attribute.Enumeration<['grid', 'carousel', 'list']> &
      Schema.Attribute.DefaultTo<'grid'>;
  };
}

export interface BlocksTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_blocks_text_blocks';
  info: {
    description: 'Rich text content section';
    displayName: 'Text Block';
    icon: 'feather';
  };
  attributes: {
    alignment: Schema.Attribute.Enumeration<['left', 'center', 'right']> &
      Schema.Attribute.DefaultTo<'left'>;
    content: Schema.Attribute.RichText & Schema.Attribute.Required;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 150;
      }>;
    variant: Schema.Attribute.Enumeration<
      ['simple', 'with-title', 'two-columns']
    > &
      Schema.Attribute.DefaultTo<'simple'>;
  };
}

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'Single question-answer pair for FAQ blocks';
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.RichText & Schema.Attribute.Required;
    question: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 200;
      }>;
  };
}

export interface SharedFeatureItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_feature_items';
  info: {
    description: 'Single feature entry for features blocks';
    displayName: 'Feature Item';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SharedFooterColumn extends Struct.ComponentSchema {
  collectionName: 'components_shared_footer_columns';
  info: {
    description: 'A column of links for multi-column footers';
    displayName: 'Footer Column';
    icon: 'layout';
  };
  attributes: {
    links: Schema.Attribute.Component<'shared.nav-item', true>;
    title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

export interface SharedNavItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_nav_items';
  info: {
    description: 'Single navigation link for navbar or footer';
    displayName: 'Nav Item';
    icon: 'link';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    target: Schema.Attribute.Enumeration<['_self', '_blank']> &
      Schema.Attribute.DefaultTo<'_self'>;
    url: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Structured SEO metadata for pages';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonical_url: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    meta_description: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 320;
      }>;
    meta_title: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 120;
      }>;
    no_index: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    og_image: Schema.Attribute.Media<'images'>;
  };
}

export interface SharedStatItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_stat_items';
  info: {
    description: 'Single statistic entry for stats blocks';
    displayName: 'Stat Item';
    icon: 'chartBubble';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    label: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 50;
      }>;
    number: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }>;
  };
}

export interface SharedTeamMember extends Struct.ComponentSchema {
  collectionName: 'components_shared_team_members';
  info: {
    description: 'Individual team member profile for team blocks';
    displayName: 'Team Member';
    icon: 'user';
  };
  attributes: {
    linkedin: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 255;
      }>;
    name: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    photo: Schema.Attribute.Media<'images'>;
    role: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'blocks.cta': BlocksCta;
      'blocks.faq': BlocksFaq;
      'blocks.features': BlocksFeatures;
      'blocks.footer': BlocksFooter;
      'blocks.hero': BlocksHero;
      'blocks.image-grid': BlocksImageGrid;
      'blocks.spacer': BlocksSpacer;
      'blocks.stats': BlocksStats;
      'blocks.team': BlocksTeam;
      'blocks.text-block': BlocksTextBlock;
      'shared.faq-item': SharedFaqItem;
      'shared.feature-item': SharedFeatureItem;
      'shared.footer-column': SharedFooterColumn;
      'shared.nav-item': SharedNavItem;
      'shared.seo': SharedSeo;
      'shared.stat-item': SharedStatItem;
      'shared.team-member': SharedTeamMember;
    }
  }
}
