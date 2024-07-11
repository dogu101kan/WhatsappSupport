/** @format */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Grid, Button, Card, TextField, Typography } from "@mui/material";
import Swal from "sweetalert2";
export const Register = () => {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        let url = apiURL + "/auth/register";

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
                    navigate("/");
                    setErr(false);
                } else {
                    setErr("ERROR");

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
                        Kayıt ol
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
                            Kayıt ol
                        </Button>
                    </Grid>
                    <Grid
                        item
                        sx={{ justifyContent: "center", display: "flex" }}
                    >
                        {" "}
                        <Button
                            variant="standard"
                            onClick={() => navigate("/")}
                            sx={{
                                marginBottom: "5%",
                                textTransform: "none",
                            }}
                        >
                            Hesabım var{" "}
                        </Button>
                    </Grid>{" "}
                </Card>
            </Grid>
        </Grid>
    );
};
