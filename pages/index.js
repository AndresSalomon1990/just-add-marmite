import { createClient } from 'contentful'
import RecipeCard from '../components/RecipeCard'

// This function gets called at build time on server-side.
// It won't be called on client-side, so you can even do
// direct database queries. See the "Technical details" section.
export async function getStaticProps() {
  const client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    accessToken: process.env.CONTENTFUL_ACCESS_KEY,
  });

  // Call an external API endpoint to get posts.
  // You can use any data fetching library
  const res = await client.getEntries({ content_type: 'recipe' });

  // By returning { props: { posts } }, the Blog component
  // will receive `posts` as a prop at build time
  return {
    props: {
      recipes: res.items,
    },
  }
}

export default function Recipes({ recipes }) {
  return (
    <div className="recipe-list">
      { recipes.map(recipe => (
        <RecipeCard key={recipe.sys.id} recipe={recipe} />
      )) }

      <style jsx>{`
        .recipe-list {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-gap: 20px 60px;
        }
      `}</style>
    </div>
  )
}