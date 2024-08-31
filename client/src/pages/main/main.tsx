import { StreamVideo, Call } from "@stream-io/video-react-sdk";
import { Navigate, useNavigate } from "react-router-dom";
import { useUser } from "../../user-context"; // Adjust the import path as needed
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import talk from '../../voice1.png';

interface Room {
  id: string;
  title: string;
  description: string;
  participantsLength: number;
  createdBy: string;
}

interface NewRoom {
  name: string;
  description: string;
}

type CustomCallData = {
  description?: string;
  title?: string;
};

const Main = () => {
  const { client, user, setCall, isLoading } = useUser();
  const [newRoom, setNewRoom] = useState<NewRoom>({ name: "", description: "" });
  const [rooms, setRooms] = useState<Room[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (client) fetchListOfCalls();
  }, [client]);

  const hashRoomName = (roomName: string): string => {
    const hash = CryptoJS.SHA256(roomName).toString(CryptoJS.enc.Base64);
    return hash.replace(/[^a-zA-Z0-9_-]/g, "");
  };

  const createRoom = async () => {
    const { name, description } = newRoom;
    if (!client || !user || !name || !description) return;
  
    const roomID = hashRoomName(name);
    const call = client.call("audio_room", roomID);
  
    await call.join({
      create: true,
      data: {
        members: [{ user_id: user.username }],
        custom: {
          title: name,
          description,
        },
      },
    });
  
    setCall(call);
    navigate(`/room/${roomID}`); // Redirect to the room after creating it
  };

  const fetchListOfCalls = async () => {
    const callsQueryResponse = await client?.queryCalls({
      filter_conditions: { ongoing: true },
      limit: 25,
      watch: true,
    });

    if (!callsQueryResponse) {
      console.log("Error fetching calls");
      return;
    }

    const getCallInfo = async (call: Call): Promise<Room> => {
      const callInfo = await call.get();
      const customData = callInfo.call.custom;
      const { title, description } = (customData || {}) as CustomCallData;
      const participantsLength = callInfo.members.length ?? 0;
      const createdBy = callInfo.call.created_by?.name ?? "";
      const id = callInfo.call.id ?? "";

      return {
        id,
        title: title ?? "",
        description: description ?? "",
        participantsLength,
        createdBy,
      };
    };

    const roomPromises = callsQueryResponse.calls.map((call) => getCallInfo(call));
    const rooms = await Promise.all(roomPromises);
    setRooms(rooms);
  };

  const joinRoom = async (roomId: string) => {
    const call = client?.call("audio_room", roomId);
    try {
      await call?.join();
      setCall(call);
      navigate("/room/" + roomId);
    } catch (err) {
      alert("Error while joining the call. Please wait for the room to be live.");
    }
  };

  if (isLoading) return <h1>Loading...</h1>;

  if (!user || !client) {
    return <Navigate to="/sign-in" />;
  }

  return (
    <StreamVideo client={client!}>
      <div className="home">
        <h1>Welcome, {user?.name}</h1>
        <div className="form">
          <h2>Create Your Own Room</h2>
          <input
            placeholder="Room Name..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            placeholder="Room Description..."
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNewRoom((prev) => ({ ...prev, description: e.target.value }))
            }
          />
          <button
            onClick={createRoom}
            style={{ backgroundColor: "rgb(125, 7, 236)" }}
          >
            Create Room
          </button>
        </div>
        <h2>{rooms.length > 0 ? "Available Rooms" : "No rooms available"}</h2>
        <div className="grid">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <div
                className="card"
                key={room.id}
                onClick={() => joinRoom(room.id)}
              >
                <h4>{room.title}</h4>
                <p>{room.description}</p>
                <p>{room.participantsLength} Participants</p>
                <p>Created By: {room.createdBy}</p>
                <div className="shine"></div>
              </div>
            ))
          ) : (
            <p></p>
          )}
        </div>
        <div className="right-side-image">
          <img src={talk}alt="Description" />
        </div>
      </div>
    </StreamVideo>
  );
};

export default Main;
