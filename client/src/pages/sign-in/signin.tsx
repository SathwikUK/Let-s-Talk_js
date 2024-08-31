import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PEOPLE_IMAGES } from '../../Images';
import Cookies from "universal-cookie";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "../../user-context";
import { useNavigate } from "react-router-dom";
import voice from './checkvoice.png';
import voice2 from './voice2 (2).png'

interface FormValues {
  username: string;
  name: string;
}

export const Signin = () => {
  const schema = yup.object().shape({
    username: yup
      .string()
      .required("Username is Required")
      .matches(/^[a-zA-Z0-9_.@$]+$/, "Invalid Username"),
    name: yup.string().required("Name is Required"),
  });
  const navigate=useNavigate();
  const cookies = new Cookies();
  const {setClient,setUser}= useUser();
  
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const { username, name } = data;

    try {
      const response = await fetch("http://localhost:5001/auth/createUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          name,
          image: PEOPLE_IMAGES[Math.floor(Math.random() * PEOPLE_IMAGES.length)],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch token");
      }

      const responseData = await response.json();
      console.log(responseData);

      const user = {
        id: username,
        name,
      };

      const myClient = new StreamVideoClient({
        apiKey: "3nzxjr64zv64",
        user,
        token: responseData.token,
      });

      setClient(myClient);
      setUser({username,name});

      const expires = new Date();
      expires.setDate(expires.getDate() + 1);
      
      cookies.set("token", responseData.token, { expires });
      cookies.set("username", responseData.username, { expires });
      cookies.set("name", responseData.name, { expires });

    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while signing in.");
    }
    navigate("/");
  };

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  return (
    <div className="home">
      <h1>Let's Talk Baka &#128540;</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label>Username: </label>
          <input type="text" {...register("username")} />
          {errors.username && (
            <p style={{ color: "red" }}>{errors.username.message}</p>
          )}
        </div>
        <div>
          <label>Name: </label>
          <input type="text" {...register("name")} />
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>
        <button type="submit">Sign In</button>
      </form><div className="img"><img src={voice}/></div>
     
    </div>
  );
};
