import { Avatar, Button, Zoom, Tooltip, IconButton } from "@material-ui/core";
import styled from "styled-components";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import ChatIcon from "@material-ui/icons/Chat";
import SearchIcon from "@material-ui/icons/Search";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import Chat from "./Chat";
import { useRouter } from "next/router";
import { Circle } from "better-react-spinkit";

function Sidebar() {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);
  const userChatRef = db
    .collection("chats")
    .where("users", "array-contains", user.email);
  const [chatSnapshot, loadingChats] = useCollection(userChatRef);

  const createChat = () => {
    const email = prompt("Provide a email to start a conversation.");

    if (!email) return null;

    if (
      EmailValidator.validate(email) &&
      !loading &&
      !chatAlreadyExists(email) &&
      email !== user.email
    ) {
      db.collection("chats").add({
        users: [user.email, email],
      });
    } else {
      alert("Please enter a valid email!");
    }
  };

  const chatAlreadyExists = (recipientEmail) =>
    !!chatSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  return (
    <Container>
      <Header>
        <UserAvatar src={user.photoURL} onClick={() => router.push("/")} />
        <IconsContainer>
          <IconButton>
            <Tooltip TransitionComponent={Zoom} title="Add new chat">
              <ChatIcon onClick={createChat} />
            </Tooltip>
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
          <Tooltip TransitionComponent={Zoom} title="Sign out">
            <IconButton onClick={() => auth.signOut()}>
              <ExitToAppIcon />
            </IconButton>
          </Tooltip>
        </IconsContainer>
      </Header>

      <Search>
        <SearchIco />
        <SearchInput placeholder="Search in chat" />
      </Search>

      {/* <SidebarButton onClick={createChat}>Start a new chat</SidebarButton> */}
      {loadingChats ? (
        <ChatLoading>
          <Circle color="#3C3C3C" size={30} />
        </ChatLoading>
      ) : (
        chatSnapshot?.docs.map((chat) => (
          <Chat
            key={chat.id}
            id={chat.id}
            users={chat.data().users}
            user={user}
          />
        ))
      )}
    </Container>
  );
}

export default Sidebar;

const Container = styled.div`
  flex: 0.45;
  border-right: 1px solid whitesmoke;
  height: 100vh;
  min-width: 300px;
  max-width: 350px;
  overflow-y: scroll;
  @media (max-width: 768px) {
    display: none;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const ChatLoading = styled.div`
  display: flex;
  justify-content: center;
  margin: 30px 0px;
`;

const Search = styled.div`
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 9px;
  border-radius: 2px;
  border-bottom: 1px solid whitesmoke;
`;
const SearchIco = styled(SearchIcon)`
  margin-right: 10px;
`;
const SearchInput = styled.input`
  outline: none;
  border: none;
  padding: 10px;
  border-radius: 20px;
  flex: 1;
`;

const SidebarButton = styled(Button)`
  width: 100%;

  &&& {
    border-bottom: 1px solid whitesmoke;
    border-top: 1px solid whitesmoke;
  }
`;

const Header = styled.div`
  display: flex;
  background-color: whitesmoke;
  position: sticky;
  top: 0;
  z-index: 1;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const UserAvatar = styled(Avatar)`
  cursor: pointer;

  :hover {
    opacity: 0.8;
  }
`;

const IconsContainer = styled.div``;
