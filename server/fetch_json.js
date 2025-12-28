async function check() {
  try {
    const res = await fetch('http://localhost:5000/api/products/3');
    const product = await res.json();
    console.log("Product Name:", product.name);
    console.log("Variants Sample:", JSON.stringify(product.variants.slice(0, 1), null, 2));
    
    // Check specific variant
    const titan = product.variants.find(v => v.color === 'Titan Tự Nhiên');
    if (titan) {
        console.log("Titan Variant:", JSON.stringify(titan, null, 2));
    } else {
        console.log("Titan variant not found in JSON");
    }
  } catch (e) {
    console.error(e.message);
  }
}

check();
