import { createClient } from 'contentful'
import Image from 'next/image'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_KEY,
});

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// the path has not been generated.
export async function getStaticPaths() {
  const res = await client.getEntries({ content_type: 'recipe' });

  // Get the paths we want to pre-render based on posts
  const paths = res.items.map(recipe => ({
    params: { slug: recipe.fields.slug },
  }));

  // We'll pre-render only these paths at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: 'blocking' }
}

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getStaticProps(context) {
  const { slug } = context.params;

  // Call an external API endpoint to get posts.
  // You can use any data fetching library

  // returns an array
  const { items } = await client.getEntries({ content_type: 'recipe', 'fields.slug': slug });

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      recipe: items[0], // pass the first and only item in the response array matching the slug
    },
  }
}

export default function RecipeDetails({ recipe }) {
  const { featuredImage, title, cookingTime, ingredients, method } = recipe.fields;

  return (
    <div>
      <div className="banner">
        <Image 
          src={'https:' + featuredImage.fields.file.url}
          width={featuredImage.fields.file.details.image.width}
          height={featuredImage.fields.file.details.image.height}
          alt='recipe-image'
        />
        <h2>{title}</h2>
      </div>
      <div className="info">
        <p>Takes about {cookingTime} mins to cook.</p>
        <h3>Ingredients</h3>
        {ingredients.map(ing => (
          <span key={ing}>{ing}</span>
        ))}
      </div>
      <div className="method">
        <h3>Method:</h3>
        <div>{documentToReactComponents(method)}</div>
      </div>

      <style jsx>{`
        h2,h3 {
          text-transform: uppercase;
        }
        .banner h2 {
          margin: 0;
          background: #fff;
          display: inline-block;
          padding: 20px;
          position: relative;
          top: -60px;
          left: -10px;
          transform: rotateZ(-1deg);
          box-shadow: 1px 3px 5px rgba(0,0,0,0.1);
        }
        .info p {
          margin: 0;
        }
        .info span::after {
          content: ", ";
        }
        .info span:last-child::after {
          content: ".";
        }
        .method {
          word-wrap: break-word;
        }
      `}</style>
    </div>
  )
}