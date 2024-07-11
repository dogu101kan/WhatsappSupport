/** @format */

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import DatePicker from "react-datepicker";
import "react-bootstrap-typeahead/css/Typeahead.css";
import "react-datepicker/dist/react-datepicker.css";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

import Cookies from "universal-cookie";

export default function Popup({
    message,
    selecetedMessage,
    setFormData,
    topicOptions,
    subTopicOptions,
}) {
    const [selectedDate, setSelectedDate] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [textArea, setTextArea] = useState();
    const [topic, setTopic] = useState({});
    const [subTopic, setSubTopic] = useState({});
    const messageDetails = message.messageDetail;
    const cookies = new Cookies();

    useEffect(() => {
        setFormData({ date: selectedDate, details: textArea });
    }, [selectedDate, textArea]);

    useEffect(() => {
        if (
            messageDetails?.messageId === message.id &&
            messageDetails?.endDate
        ) {
            const isoDate = new Date(messageDetails.endDate);
            setSelectedDate(isoDate);
        }

        if (
            messageDetails?.messageId === message.id &&
            messageDetails?.detail
        ) {
            setTextArea(messageDetails.detail);
        }

        if (messageDetails?.messageId === message.id && messageDetails?.topic) {
            setTopic({
                name: messageDetails.topic.topicName,
                value: messageDetails.topic.id,
            });
        }

        if (
            messageDetails?.messageId === message.id &&
            messageDetails?.subTopic
        ) {
            setSubTopic({
                name: messageDetails.subTopic.subTopicName,
                value: messageDetails.subTopic.id,
            });
        }
    }, [messageDetails, message]);

    const fetchData = () => {
        if (selecetedMessage !== null) {
            setError(false);
            setLoading(true);
            let url = apiURL + `/message/edittopics/${selecetedMessage}`;
            let headers = new Headers();

            headers.append("Content-Type", "application/json");
            headers.append("authorization", "Bearer " + cookies.get("token"));
            fetch(url, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    topic: topic.value,
                    subTopic: subTopic.value,
                }),
            })
                .then((response) => response.json())
                .then((json) => {
                    if (json.success === false) {
                        setError(true);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        fetchData();
    }, [topic, subTopic]);

    return (
        <div className="shadow-lg shadow-[#2a3942]">
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 360,
                    bgcolor: "white",
                    color: "black",
                }}
            >
                <nav aria-label="main mailbox folders">
                    <List>
                        <ListItem disablePadding>
                            <DatePicker
                                placeholderText="Tarihi buraya girin.."
                                className="mx-2 bg-[white] placeholder:text-xs p-1 border-[black] border-2"
                                selected={selectedDate}
                                onChange={(date) =>
                                    setSelectedDate(new Date(date))
                                }
                            />
                        </ListItem>
                        <Divider />
                        <ListItem disablePadding>
                            <textarea
                                placeholder="Aciklamayi buraya yazin..."
                                id="details"
                                className="bg-[white] mx-2 text-xs w-full p-1"
                                defaultValue={textArea}
                                rows="2"
                                onChange={(e) => setTextArea(e.target.value)}
                            ></textarea>
                        </ListItem>
                        <Divider />
                        <ListItem disablePadding>
                            <Divider />
                            <Autocomplete
                                disablePortal
                                options={topicOptions}
                                sx={{
                                    width: "100%",
                                    marginX: "0.5rem",
                                    marginTop: "0.2rem",
                                    color: "#e1e5e7",
                                    backgroundColor: "white",
                                    "& .MuiInputLabel-root": { color: "white" },
                                    "& .MuiOutlinedInput-root": {
                                        borderColor: "white",
                                        "&.Mui-focused": {
                                            borderColor: "white",
                                        },
                                    },
                                    "& .MuiInputBase-root": { color: "white" },
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={topic.name}
                                        sx={{
                                            color: "white",
                                            borderColor: "white",
                                        }}
                                    />
                                )}
                                onChange={(event, selectedOption) => {
                                    setTopic({
                                        name: selectedOption.label,
                                        value: selectedOption.value,
                                    });
                                    fetchData();
                                }}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem disablePadding>
                            <Divider />
                            <Autocomplete
                                disablePortal
                                options={subTopicOptions}
                                sx={{
                                    width: "100%",
                                    marginX: "0.5rem",
                                    marginTop: "0.2rem",
                                    backgroundColor: "white",
                                    "& .MuiInputLabel-root": { color: "white" },
                                    "& .MuiOutlinedInput-root": {
                                        borderColor: "white",
                                        "&.Mui-focused": {
                                            borderColor: "white",
                                        },
                                    },
                                    "& .MuiInputBase-root": { color: "white" },
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={subTopic.name}
                                        style={{ color: "white" }}
                                    />
                                )}
                                onChange={(event, selectedOption) => {
                                    setSubTopic({
                                        name: selectedOption.label,
                                        value: selectedOption.value,
                                    });
                                    fetchData();
                                }}
                            />
                        </ListItem>
                    </List>
                </nav>
            </Box>
        </div>
    );
}
