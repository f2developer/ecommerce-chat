// Import the custom ChatWidget component for AI assistance
import ChatWidget from './ChatWidget'

// Main e-commerce store component (শুধু ChatWidget সহ)
const EcommerceStore = () => {

  // Component returns JSX for the entire store layout
  return (
    // React Fragment to wrap multiple elements without extra DOM node
    <>
      {/* AI chat widget component (floating chat button/window) */}
      <ChatWidget />
    </>
  )
}

// Export component as default export for use in other files
export default EcommerceStore