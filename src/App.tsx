import useFetch from "./hooks/useFetch";

interface userObj {
  data: {
    address: {
      geolocation: {
        lat: string;
        long: string;
      };
      city: string;
      street: string;
      number: number;
      zipcode: string;
    };
    id: number;
    email: string;
    username: string;
    password: string;
    name: {
      firstname: string;
      lastname: string;
    };
    phone: string;
    v: number;
  }[];
  isLoading: boolean;
  error: string;
}
interface productObj {
  data: {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
      rate: number;
      count: number;
    };
  }[];
  isLoading: boolean;
  error: string;
}
interface cartObj {
  data: {
    id: number;
    userId: number;
    date: string;
    products: [
      {
        productId: number;
        quantity: number;
      },
      {
        productId: number;
        quantity: number;
      },
      {
        productId: number;
        quantity: number;
      }
    ];
    __v: number;
  }[];
  isLoading: boolean;
  error: string;
}
interface sumType {
  [key: string]: number | undefined;
}
interface User {
  id: number;
  address: {
    geolocation: {
      lat: string;
      long: string;
    };
  };
  name: {
    firstname: string;
    lastname: string;
  };
}
interface Product {
  data: {
    id: number;
    title: string;
    price: number;
    description: string;
    category: string;
    image: string;
    rating: {
      rate: number;
      count: number;
    };
  }[];
}
export const getCalculations = () =>{
  const users: userObj = useFetch("users");
  const productsInfo: productObj = useFetch("products");
  const products = productsInfo.data;
  const cartsInfo: cartObj = useFetch(
      "carts/?startdate=2000-01-01&enddate=2023-04-07"
  );
  const carts = cartsInfo.data;

  function countProducts() {
    const sum: sumType = {};
    for (const prod in products) {
      if (sum[products[prod]["category"]] === undefined) {
        sum[products[prod]["category"]] = products[prod]["price"];
      } else if (sum[products[prod]["category"]] !== undefined) {
        sum[products[prod]["category"]] += products[prod]["price"];
      }
    }
    sum["men's clothing"] = Number(sum["men's clothing"]?.toFixed(2));
    return sum;
  }

  const sumProductsByCategory = countProducts();
  function getHighestValueCart() {
    const sums = carts.map((item) => {
      return item.products.reduce((acc, item) => {
        const price = products.find(
            (product) => product.id === item.productId
        )?.price;
        return acc + price * item.quantity;
      }, 0);
    }, []);

    const cartIndex = sums.indexOf(Math.max(...sums));
    const cartId = carts[cartIndex]?.id;

    const cartOwnerId = carts[cartIndex]?.userId;
    const ownerObject = users.data.find((user) => user.id === cartOwnerId)?.name;
    const cartValue = Math.max(...sums);

    return {
      id: cartId,
      name: ownerObject?.firstname + " " + ownerObject?.lastname,
      value: cartValue,
    };
  }

  const highestValueCart = getHighestValueCart();

  function findFurthestUsers(users: User[]): string[] {
    let maxDistance = 0;
    let names: string[] = [];
    let dist: number[] = [];

    for (let i = 0; i < users.length - 1; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const user1 = users[i];
        const user2 = users[j];

        const lat1 = parseFloat(user1.address.geolocation.lat);
        const long1 = parseFloat(user1.address.geolocation.long);
        const lat2 = parseFloat(user2.address.geolocation.lat);
        const long2 = parseFloat(user2.address.geolocation.long);

        const distance = Math.sqrt(
            Math.pow(lat2 - lat1, 2) + Math.pow(long2 - long1, 2)
        );

        if (distance > maxDistance) {
          maxDistance = distance;
        }

        names.push(
            users[i].name.firstname +
            " " +
            users[i].name.lastname +
            " and " +
            users[j].name.firstname +
            " " +
            users[j].name.lastname
        );
        dist.push(distance);
      }
    }
    const maxIndexes = [...dist.keys()].filter((i) => dist[i] === maxDistance);
    return maxIndexes.map((i) => names[i]);
  }

  const furthestUsers = findFurthestUsers(users.data);

  return {countProducts, getHighestValueCart, findFurthestUsers, sumProductsByCategory, highestValueCart, furthestUsers };
}
function App() {
  const {sumProductsByCategory, highestValueCart, furthestUsers} = getCalculations();

  return (
    <div className="app">
      <div ><p>All available product categories and the total value of
        products of a given category:</p>
        {Object.keys(sumProductsByCategory).map((key, index) => (
            <p key={index}>{key}: {sumProductsByCategory[key]}</p>
        ))}
      </div>
      <br />
      <p>Details of the highest value cart are:</p>
      <p>Cart id: {highestValueCart.id}</p>
      <p>Cart owner: {highestValueCart.name}</p>
      <p>Cart value: {highestValueCart.value}</p>
      <br />
      <p>People that live furthest away from each other are:</p>
      <p>{furthestUsers.join(", ")}</p>
    </div>
  );
}

export default App;
