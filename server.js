Here’s the corrected code:

---

### **Frontend Code**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="The Middlesex School - This website offers an online store for After school classes for the convenience of parents and students.">
    <meta name="keywords" content="After School Classes, Help Classes, The Middlesex School">
    <meta name="author" content="Mithra Iyengar Ramprabu">
    <title>The Middlesex School</title>
    <link rel="icon" type="image/x-icon" href="assets/the-mdx-school.png">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script>
</head>
<body>
    <div id="app">
        <header>
            <nav id="navigation-bar">
                <figure @mouseover="showSchoolInfo = true" @mouseleave="showSchoolInfo = false" class="nav-item">
                    <img style="width:50px;height:50px;" :src="school.logo" class="nav-logo" alt="School Logo">
                </figure>
                <p @mouseover="showInfo = true" @mouseleave="showInfo = false" class="nav-item">INFO</p>
                <p @mouseover="showContact = true" @mouseleave="showContact = false" class="nav-item">CONTACT</p>
                <div id="search-box">
                    <i class="fa fa-search search-icon"></i>
                    <input type="text" id="search-area" placeholder="Search" v-model="searchQuery">
                </div>
                <button class="nav-item nav-button" @click="sortToggle">
                    SORT <i class="fa fa-filter"></i>
                </button>
                <button class="nav-item nav-button">
                    <a href="Checkout.html">
                        CHECKOUT <i class="fa fa-cart-shopping"></i> <span class="cart-count">{{ cartItems }}</span>
                    </a>
                </button>
            </nav>
            <div v-if="showSchoolInfo" class="info-box" @mouseover="showSchoolInfo = true" @mouseleave="showSchoolInfo = false">
                <h1>{{ school.name }}</h1>
                <img :src="school.logo" alt="School Logo" style="width: 50px;">
            </div>
            <div v-if="showInfo" class="info-box" @mouseover="showInfo = true" @mouseleave="showInfo = false">
                <p>This web app allows students and parents to explore and purchase after-school classes and activities.</p>
            </div>
            <div v-if="showContact" class="info-box" @mouseover="showContact = true" @mouseleave="showContact = false">
                <p>Contact us at <a href="tel:+123456789">+1 234 56789</a> or <a href="mailto:someone@example.com">someone@example.com</a></p>
            </div>
        </header>
        <main>
            <section id="sort-section" v-if="showSort">
                <h3><i class="fas fa-filter"></i> Sort & Filter</h3>
                <div>
                    <h4>Sort By:</h4>
                    <select v-model="sortOrder">
                        <option disabled value="">Select Sort Option</option>
                        <option value="price-asc">Price (Low to High)</option>
                        <option value="price-desc">Price (High to Low)</option>
                        <option value="availability-asc">Seats Available (Low to High)</option>
                        <option value="availability-desc">Seats Available (High to Low)</option>
                    </select>
                </div>
            </section>
            <section id="product-section" v-if="!showCheckout">
                <div v-for="product in filterAndSort" :key="product.id" class="product-card">
                    <img :src="product.img" class="product-img" alt="Product Image">
                    <h2>{{ product.title }}</h2>
                    <p>{{ product.location }}</p>
                    <p v-if="product.availability > 0">{{ product.availability }} seats available</p>
                    <p v-else>All out!</p>
                    <p v-if="product.availability > 0 && product.availability <= 3" class="low-stock-warning">Only {{ product.availability }} left!</p>
                    <p>${{ product.price }}</p>
                    <button @click="addToCart(product)" :disabled="product.availability === 0">
                        {{ product.availability === 0 ? 'Unavailable' : 'ADD TO CART' }}
                    </button>
                    <div class="rating">
                        <span v-for="n in product.rating">★</span>
                        <span v-for="n in 5 - product.rating">☆</span>
                    </div>
                </div>
            </section>
        </main>
    </div>
    <script>
        new Vue({
            el: '#app',
            data: {
                school: {
                    name: 'The Middlesex School',
                    logo: 'assets/the-mdx-school.png'
                },
                cart: [],
                showSchoolInfo: false,
                showCheckout: false,
                showInfo: false,
                showContact: false,
                showSort: false,
                searchQuery: '',
                sortOrder: '',
                products: [
                    { id: 1000, title: 'Maths', location: 'London', availability: 5, price: 8, img: 'assets/Math-Symbol.png', rating: 3 },
                    { id: 1001, title: 'English', location: 'Dubai', availability: 5, price: 16, img: 'assets/English-Symbol.png', rating: 4 },
                    { id: 1002, title: 'Science', location: 'Mauritius', availability: 5, price: 32, img: 'assets/Science-Symbol.png', rating: 5 },
                    { id: 1003, title: 'History', location: 'London', availability: 5, price: 64, img: 'assets/History-Symbol.png', rating: 4 },
                    { id: 1004, title: 'Computer', location: 'Dubai', availability: 5, price: 128, img: 'assets/Computer-Symbol.png', rating: 5 },
                    { id: 1005, title: 'Geography', location: 'Mauritius', availability: 5, price: 64, img: 'assets/Geography-Symbol.png', rating: 3 },
                    { id: 1006, title: 'Sports', location: 'Dubai', availability: 5, price: 128, img: 'assets/Sports-Symbol.png', rating: 4 },
                    { id: 1007, title: 'Music', location: 'London', availability: 5, price: 32, img: 'assets/Music-Symbol.png', rating: 2 },
                    { id: 1008, title: 'French', location: 'Mauritius', availability: 5, price: 16, img: 'assets/French-Symbol.png', rating: 4 },
                    { id: 1009, title: 'Spanish', location: 'Dubai', availability: 5, price: 16, img: 'assets/Spanish-Symbol.png', rating: 5 }
                ]
            },
            computed: {
                filterAndSort() {
                    let filteredProds = this.products.filter(product =>
                        product.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                        product.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                        product.price.toString().includes(this.searchQuery) ||
                        product.availability.toString().includes(this.searchQuery)
                    );
                    if (this.sortOrder === 'price-asc') {
                        filteredProds.sort((a, b) => a.price - b.price);
                    } else if (this.sortOrder === 'price-desc') {
                        filteredProds.sort((a, b) => b.price - a.price);
                    } else if (this.sortOrder === 'availability-asc') {
                        filteredProds.sort((a, b) => a.availability - b.availability);
                    } else if (this.sortOrder === 'availability-desc') {
                        filteredProds.sort((a, b) => b.availability - a.availability);
                    }
                    return filteredProds;
                },
                cartItems() {
                    return this.cart.reduce((total, item) => total + item.quantity, 0);
                }
            },
            methods: {
                addToCart(product) {
                    if (product.availability > 0) {
                        product.availability -= 1;
                        const cartItem = this.cart.find(item => item.id === product.id);
                        if (cartItem) {
                            cartItem.quantity += 1;
                        } else {
                            this.cart.push({ ...product, quantity: 1 });
                        }
                        this.prodAvailServer(product.id, product.availability);
                        localStorage.setItem('cart', JSON.stringify(this.cart));
                    }
                },
                prodAvailServer(productId, updatedAvailability) {
                    fetch(`https://backend-mdx.onrender.com/collections/Lessons/${productId}`, {


                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ availability: updatedAvailability })
                    })
                    .then(response => response.json())
                    .then(data => console.log('Product availability updated:', data))
                    .catch(error => console.error('Error updating availability:', error));
                },
                updateProdAvail() {
                    fetch('https://backend-mdx.onrender.com/collections/Lessons')
                        .then(response => response.json())
                        .then(data => {
                            data.forEach(updatedLesson => {
                                const product = this.products.find(p => p.id === updatedLesson.id);
                                if (product) {
                                    product.availability = updatedLesson.availability;
                                }
                            });
                            this.$forceUpdate();
                        })
                        .catch(error => console.error('Error fetching updated availability:', error));
                },
                sortToggle() {
                    this.showSort = !this.showSort;
                }
            },
            mounted() {
                this.updateProdAvail();
            }
        });
    </script>
</body>
</html>
```
