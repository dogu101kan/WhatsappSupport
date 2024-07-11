/** @format */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { setAccount } from "../../redux-store/auth/actions";
import Swal from "sweetalert2";
import { Grid, Button, Typography, TextField, Card } from "@mui/material";
export const Login = () => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    const navigate = useNavigate();
    const cookies = new Cookies();

    const handleSubmit = (e) => {
        e.preventDefault();

        setLoading(true);
        let url = apiURL + "/auth/login";

        let headers = new Headers();

        headers.append("Content-Type", "application/json");

        fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((json) => {
                setLoading(false);
                if (json.success === true) {
                    cookies.set("token", json.access_token);
                    setAccount({
                        token: json.access_token,
                        username: json.data.username,
                        id: json.data.id,
                    });
                    navigate("/chat");
                    setErr(false);
                } else {
                    Swal.fire({
                        title: json.message,
                        icon: "error",
                        confirmButtonText: "Tamam",
                    });
                }
            })
            .catch(setLoading(false));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    return (
        <Grid
            container
            sx={{
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
            }}
        >
            <Grid
                container
                xs={10}
                lg={4}
                sx={{ justifyContent: "center", height: "70vh " }}
            >
                <Card
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        justifyContent: "center",
                        flexDirection: "column",
                        display: "flex",
                        flex: 1,
                        boxShadow: 5,
                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            textAlign: "center",
                        }}
                    >
                        Giriş Yap
                    </Typography>
                    <TextField
                        id="username"
                        type="username"
                        placeholder="kullanici adi"
                        onChange={handleChange}
                        sx={{ margin: "5% 5% 0 5%" }}
                    />
                    <TextField
                        id="password"
                        type="password"
                        placeholder="*******"
                        onChange={handleChange}
                        sx={{ margin: "5% 5% 0 5%" }}
                    />
                    <Grid
                        item
                        sx={{ justifyContent: "center", display: "flex" }}
                    >
                        <Button
                            variant="outlined"
                            type="submit"
                            sx={{
                                marginTop: "5%",
                                marginBottom: "2%",
                                textTransform: "none",
                            }}
                        >
                            Giriş yap
                        </Button>
                    </Grid>
                    <Grid
                        item
                        sx={{ justifyContent: "center", display: "flex" }}
                    >
                        {" "}
                        <Button
                            variant="standard"
                            onClick={() => navigate("/register")}
                            sx={{
                                marginBottom: "5%",
                                textTransform: "none",
                            }}
                        >
                            Kayıt ol
                        </Button>
                    </Grid>{" "}
                </Card>
            </Grid>
        </Grid>
    );
};
