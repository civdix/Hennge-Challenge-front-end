import type { CSSProperties, Dispatch, SetStateAction } from "react";
import { useState } from "react";

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

interface FormData {
  username: string;
  password: string;
}
const errors: { [key: number]: string } = {
  1: "Password must be at least 10 characters long", //check
  2: "Password must be at most 24 characters long",
  3: "Password cannot contain spaces",
  4: "Password must contain at least one number",
  5: "Password must contain at least one uppercase letter",
  6: "Password must contain at least one lowercase letter",
};
function CreateUserForm({ setUserWasCreated }: CreateUserFormProps) {
  const [checks, setChecks] = useState<number[]>([]);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
  });
  const [errorMsg, setErrorMsg] = useState<string>("");
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  function validation(password: string): boolean {
    const tempChecks: number[] = [];
    if (password.length < 10) {
      tempChecks.push(1);
    }
    if (password.length > 24) {
      tempChecks.push(2);
    }
    if (password.includes(" ")) {
      tempChecks.push(3);
    }
    if (!/\d/.test(password)) {
      tempChecks.push(4);
    }
    if (!/[A-Z]/.test(password)) {
      tempChecks.push(5);
    }
    if (!/[a-z]/.test(password)) {
      tempChecks.push(6);
    }
    console.log(tempChecks, password);
    setChecks([...tempChecks]);
    return tempChecks.length > 0 ? false : true;
  }
  // Initializes checks as an empty array of numbers

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setChecks([]);
    setErrorMsg("");
    if (!validation(formData.password)) {
      return;
    }
    // No check error now make a fetch api post request to the open api of henngee
    const url =
      "https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup";

    try {
      setErrorMsg("Wait for Resposne");
      const response = await fetch(url, {
        method: "POST", // HTTP method
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsicHJpbmNlZGl4aXQ5NzIwOTY1OTg1QGdtYWlsLmNvbSJdLCJpc3MiOiJoZW5uZ2UtYWRtaXNzaW9uLWNoYWxsZW5nZSIsInN1YiI6ImNoYWxsZW5nZSJ9.yN3iktv-gK6QXiGm1imjGdwgxq7e7dkqWGoAl63sii0",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const statusCode = response.status;
      console.log(statusCode);
      switch (statusCode) {
        case 500:
          setErrorMsg("Something went wrong, please try again.");
          break;
        case 422:
          setErrorMsg(
            "Sorry, the entered password is not allowed, please try a different one."
          );
          break;
        case 401:
        case 403:
          setErrorMsg("Not authenticated to access this resource.");
          break;
        default:
          setErrorMsg("User created successfully!");
          setUserWasCreated?.(true); // if the prop is optional
      }
    } catch (error) {
      console.log("Error from HandleSubmit:", error);
    }
  };
  return (
    <div style={formWrapper}>
      <form style={form}>
        {/* make sure the username and password are submitted */}
        {/* make sure the inputs have the accessible names of their labels */}
        {errorMsg.length > 1 && (
          <div>
            <h3>{errorMsg}</h3>
          </div>
        )}
        <label htmlFor="username" style={formLabel}>
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          style={formInput}
          onChange={handleChange}
          aria-invalid={formData.username.trim().length === 0}
        />

        <label htmlFor="password" style={formLabel}>
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          style={formInput}
          onChange={handleChange}
          aria-invalid={checks.length > 0}
          aria-describedby="password-errors"
        />

        <button
          style={formButton}
          id="password-errors"
          onClick={handleSubmit}
          disabled={
            formData.password.length > 0 && formData.username.length > 0
              ? false
              : true
          }
        >
          Create User
        </button>
        <ul>
          {checks.length >= 1 &&
            checks.map((check) => {
              return <li key={check}>{errors[check]}</li>;
            })}
        </ul>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: "500px",
  width: "80%",
  backgroundColor: "#efeef5",
  padding: "24px",
  borderRadius: "8px",
};

const form: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: "none",
  padding: "8px 16px",
  height: "40px",
  fontSize: "14px",
  backgroundColor: "#f8f7fa",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  borderRadius: "4px",
};

const formButton: CSSProperties = {
  outline: "none",
  borderRadius: "4px",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  backgroundColor: "#7135d2",
  color: "white",
  fontSize: "16px",
  fontWeight: 500,
  height: "40px",
  padding: "0 8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "8px",
  alignSelf: "flex-end",
  cursor: "pointer",
};
