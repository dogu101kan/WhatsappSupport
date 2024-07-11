/** @format */

import { useState, useEffect, useRef } from "react";
import { parseJwt } from "../../utils/jwtParser";
import { Contact } from "../../components/contacts";
import { Message } from "../../components/message";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import NotificationSound from "../../assets/sounds/notification-sound.mp3";
import QRModal from "../../components/qrModal";
import Cookies from "universal-cookie";
import io from "socket.io-client";
import Swal from "sweetalert2";
import { mdiFileUpload } from "@mdi/js";
import Icon from "@mdi/react";
import { Grid, Typography } from "@mui/material";
import Highlighter from "react-highlight-words";
import MediaModalForInputBar from "../../components/mediaModalForInputBar/mediaModalForInputBar";
const socket = io.connect(apiURL_SOCKET);

const Chat = () => {
    const cookies = new Cookies();

    const audioPlayer = useRef(null);
    const findMessageRef = useRef();
    const lastMessageRef = useRef(null);
    const [limit, setLimit] = useState(20);
    const [offset, setOffset] = useState(0);
    const [selectedPhone, setSelectedPhone] = useState();
    const [qr, setQr] = useState(null);
    const [chatId, setChatId] = useState(null);
    const [customers, setCustomers] = useState();
    const [filteredCustomers, setFilteredCustomers] = useState(customers);
    const [textFilter, setTextFilter] = useState("");
    const [currentCustomer, setCurrentCustomer] = useState();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState();
    const [notification, setNotification] = useState(false);
    const [hasFixedFilter, setHasFixedFilter] = useState(false);
    const [filters, setFilters] = useState(null);
    const [allFixed, setAllFixed] = useState(false);
    const [scrollIntoView, setScrollIntoView] = useState(false);
    const [newMessageForSlider, setNewMessageForSlider] = useState(false); ////////////
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [base64Data, setBase64Data] = useState([]);
    const [topicOptions, setTopicOptions] = useState([]);
    const [subTopicOptions, setSubTopicOptions] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(0);
    const [selectedSubTopic, setSelectedSubTopic] = useState(0);
    const [scrollHeight, setScrollHeight] = useState();
    const [scrollOffset, setScrollOffset] = useState(0);
    const [infiniteScroll, setInfiniteScroll] = useState(false);
    const [firstDateFilter, setFirstDateFilter] = useState(null);
    const [secondDateFilter, setSecondDateFilter] = useState(null);
    const [userAccess, setUserAccess] = useState(false);
    const [userAccessUsername, setUserAccessUsername] = useState("");
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [searchedAndSelectedMessageId, setSearchedAndSelectedMessageId] =
        useState(null);
    const [
        searchedAndSelectedMessageIdList,
        setSearchedAndSelectedMessageIdList,
    ] = useState([]);
    const [searchedMessagesForUserBar, setSearchedMessageForUserBar] =
        useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);

    const formatDate = (dateString) => {
        const currentDate = new Date();
        const inputDate = new Date(dateString);

        const isSameDay =
            currentDate.toDateString() === inputDate.toDateString();
        const isYesterday =
            new Date(currentDate - 86400000).toDateString() ===
            inputDate.toDateString();

        if (isSameDay) {
            const options = { hour: "numeric", minute: "numeric" };
            return inputDate.toLocaleTimeString("tr-TR", options);
        } else if (isYesterday) {
            return "Dün";
        } else {
            const options = {
                day: "numeric",
                month: "numeric",
                year: "numeric",
            };
            return inputDate.toLocaleDateString("tr-TR", options);
        }
    };

    const playAudio = () => {
        audioPlayer.current.play();
    };

    // useEffect(() => {
    //     if (!textFilter) {
    //         setFilteredCustomers(customers);
    //     } else {
    //         customers &&
    //             setFilteredCustomers(
    //                 customers.filter((customer) => {
    //                     const phoneNumber = customer.phoneNumber
    //                         .toLowerCase()
    //                         .includes(textFilter.toLowerCase());
    //                     const username = customer.username
    //                         ?.toLowerCase()
    //                         .includes(textFilter.toLowerCase());

    //                     return phoneNumber || username;
    //                 })
    //             );
    //     }
    // }, [textFilter]);

    useEffect(() => {
        let wp_message = (data) => {
            playAudio();
            console.log(chatId);
            if (
                (currentCustomer === data.customerId ||
                    data.customerId === null) &&
                data.chatId === chatId
            ) {
                setMessages((prev) => [...prev, data]);
                setNewMessageForSlider(true);
            } else setNotification(true);
        };

        socket.on("wp_message", wp_message);
        return () => {
            socket.off("wp_message", wp_message);
        };
    }, [socket, messages]);

    useEffect(() => {
        let wp_qr = (data) => {
            setQr(data);
            if (data == null) {
                setQrModalOpen(false);
                Swal.fire({
                    title: "Whatsapp'a başarıyla giriş yapıldı",
                    icon: "success",
                    confirmButtonText: "Tamam",
                });
            } else setQrModalOpen(true);
        };
        socket.on("wp_qr", wp_qr);
        return () => {
            socket.off("wp_qr", wp_qr);
        };
    }, [socket, qr]);

    const search = async () => {
        let url;
        url =
            apiURL +
            `/customer/getfilteredchats?hasFixed=${hasFixedFilter}&topicId=${selectedTopic}&subTopicId=${selectedSubTopic}&firstDate=${firstDateFilter}&secondDate=${secondDateFilter}&searchedMessage=${textFilter}`;

        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.success === false) {
                    setCustomers(false);
                    cookies.remove("token");
                } else {
                    setCustomers(json.data);
                    setSearchedMessageForUserBar(json?.messages);
                    setChatId(messages?.[0].chatId);
                }
                console.log(offset);
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        setLoading(true);
        let url;
        url =
            apiURL +
            `/customer/getfilteredchats?hasFixed=${hasFixedFilter}&topicId=${selectedTopic}&subTopicId=${selectedSubTopic}&firstDate=${firstDateFilter}&secondDate=${secondDateFilter}&searchedMessage=${textFilter}`;

        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.success === false) {
                    setCustomers(false);
                    cookies.remove("token");
                } else {
                    setCustomers(json.data);
                    setSearchedMessageForUserBar(json?.messages);
                    setChatId(messages?.[0].chatId);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
        setNotification(false);
    }, [
        messages,
        notification,
        hasFixedFilter,
        allFixed,
        selectedTopic,
        selectedSubTopic,
        firstDateFilter,
        secondDateFilter,
    ]);

    useEffect(() => {
        setLoading(true);

        const url = apiURL + "/message/topics";

        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.success === false) {
                } else {
                    setTopicOptions(
                        json.data.map((item) => ({
                            label: item.topicName,
                            value: item.id,
                        }))
                    );
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setLoading(true);

        const url = apiURL + "/message/subtopics";

        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.success === false) {
                } else {
                    setSubTopicOptions(
                        json.data.map((item) => ({
                            label: item.subTopicName,
                            value: item.id,
                        }))
                    );
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        setSearchedAndSelectedMessageId(null);
        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        let url = apiURL + `/customer/${selectedPhone}/notification`;
        fetch(url, {
            method: "GET",
            headers: headers,
        });
    }, [selectedPhone]);

    useEffect(() => {
        setOffset(0);
        setLimit(20);
        if (selectedPhone !== undefined && selectedPhone !== null) {
            setLoading(true);
            let url =
                apiURL + `/customer/${selectedPhone}?limit=${20}&offset=${0}`;
            let headers = new Headers();
            headers.append("authorization", "Bearer " + cookies.get("token"));

            fetch(url, {
                method: "GET",
                headers: headers,
            })
                .then((response) => response.json())
                .then((json) => {
                    if (json.success === false) {
                        setMessages([]);
                        if (json.message)
                            Swal.fire({
                                title: json.message,
                                icon: "error",
                                confirmButtonText: "Tamam",
                            });
                    } else {
                        setMessages([]);
                        setMessages(json.data.messages);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                });
        }
    }, [selectedPhone, allFixed]);

    const removeFile = (data) => {
        setBase64Data([
            ...base64Data.filter((item) => item.filename !== data.filename),
        ]);
    };

    useEffect(() => {
        if (
            selectedPhone !== undefined &&
            selectedPhone !== null &&
            offset !== 0
        ) {
            setLoading(true);
            let url =
                apiURL +
                `/customer/${selectedPhone}?limit=${limit}&offset=${offset}`;
            let headers = new Headers();
            headers.append("authorization", "Bearer " + cookies.get("token"));
            fetch(url, {
                method: "GET",
                headers: headers,
            })
                .then((response) => response.json())
                .then((json) => {
                    setInfiniteScroll(!infiniteScroll);
                    if (json.success === false) {
                        setMessages([]);
                        if (json.message)
                            Swal.fire({
                                title: json.message,
                                icon: "error",
                                confirmButtonText: "Tamam",
                            });
                    } else {
                        json.data.messages &&
                            setMessages((prev) => [
                                ...json.data.messages,
                                ...prev,
                            ]);
                        if (
                            searchedAndSelectedMessageId &&
                            !json.data.messages.some(
                                (item) =>
                                    item.id === searchedAndSelectedMessageId
                            ) &&
                            !messages.some(
                                (item) =>
                                    item.id === searchedAndSelectedMessageId
                            )
                        ) {
                            setOffset(offset + limit);
                            setScrollOffset(offset);
                        }
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.log(err);
                    setLoading(false);
                })
                .finally(() => {
                    if (searchedAndSelectedMessageId) {
                        setTimeout(() => {
                            findMessageRef.current?.scrollIntoView({
                                behavior: "smooth",
                            });

                            setNewMessageForSlider(false);
                        }, 500);
                    }
                });
        }
    }, [offset]);

    const handleAccessFetch = () => {
        setLoading(true);
        let url =
            apiURL +
            `/user/useraccess?status=${userAccess}&username=${userAccessUsername}`;
        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((json) => {
                setLoading(false);
                if (json.success === true) {
                    Swal.fire({
                        title: "Başarılı",
                        icon: "success",
                    });
                } else {
                    Swal.fire({
                        title: json.message,
                        icon: "error",
                        confirmButtonText: "Tamam",
                    });
                }
                setLoading(false);
            });
    };

    const handleSendMessage = () => {
        let data;

        if (base64Data.length > 0) {
            base64Data.forEach((base64, index) => {
                data = {
                    hasMedia: true,
                    hasFixed: true,
                    message: index === 0 ? newMessage : "",
                    userId: user.id,
                    file: {
                        media: base64.data,
                        mediaType: base64.mediaType,
                        filename: base64.filename,
                    },
                };
                socket.emit("new_message", { ...data, selectedPhone });
            });

            messages
                ? setMessages([...messages, { ...data, createdAt: new Date() }])
                : setMessages([{ ...data, createdAt: new Date() }]);
            setNewMessage("");
            setBase64Data([]);

            let fileInput = document.getElementById("fileInput");
            fileInput.value = null;
        } else if (newMessage.trim().length > 0) {
            data = {
                hasMedia: false,
                hasFixed: true,
                message: newMessage,
                userId: user.id,
                customerId: null,
                file: {
                    media: null,
                    mediaType: null,
                    filename: null,
                },
            };
            socket.emit("new_message", { ...data, selectedPhone });

            messages
                ? setMessages([...messages, { ...data, createdAt: new Date() }])
                : setMessages([{ ...data, createdAt: new Date() }]);
            setNewMessage("");
            setBase64Data([]);

            let fileInput = document.getElementById("fileInput");
            fileInput.value = null;
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === "Enter" && event.shiftKey) {
            setNewMessage((prevMessage) => prevMessage + "\n");
        } else if (event.key === "Enter") {
            handleSendMessage();
            setNewMessage("");
        }
    };

    const handleFilterInputKeyPress = (event) => {
        if (event.key === "Enter") {
            search(textFilter);
            if (
                !textFilter.match(
                    /^[\]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
                )
            )
                return;
            setSelectedPhone(textFilter);

            setTextFilter("");
        }
    };

    const handleAllMessageFixed = () => {
        if (!currentCustomer) return;
        setLoading(true);
        let url = apiURL + `/message/allmessagesfixed/${currentCustomer}`;
        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((json) => {
                if (json.success === false) {
                    Swal.fire({
                        title: json.message,
                        icon: "error",
                        confirmButtonText: "Tamam",
                    });
                } else {
                    setAllFixed(!allFixed);
                    setSelectedPhone("");
                    setMessages([]);
                }
            })
            .catch((err) => {
                console.log(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        user && socket.emit("addUser", user.id);
    }, [user]);

    useEffect(() => {
        setUser(parseJwt(cookies.get("token")));
    }, [socket]);

    useEffect(() => {
        const chatdiv = document.getElementById("chatdiv");

        if (offset != 0) {
            chatdiv.scrollTo(0, chatdiv.scrollHeight - scrollHeight);
        }
    }, [infiniteScroll]);

    useEffect(() => {
        scrollIntoView &&
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        setScrollIntoView(false);
        setScrollOffset(0);
    }, [scrollIntoView]);

    useEffect(() => {
        if (!searchedAndSelectedMessageId) {
            // setTimeout içinde 1000 milisaniye (1 saniye) gecikme eklenmiştir.
            setTimeout(() => {
                lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        }
    }, [selectedPhone]);

    useEffect(() => {
        scrollIntoView &&
            lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
        setScrollIntoView(false);
        setScrollOffset(0);
    }, [scrollIntoView]);

    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === "Escape" && base64Data.length > 0) {
                Swal.fire({
                    title: "Gönderilmemiş mesaj silinsin mi?",
                    text: "Bu ekrandan çıkarsanız mesajınız ve eklediğiniz medya gönderilmeyecek.",
                    confirmButtonText: "Sil",
                    confirmButtonColor: "red",
                    showCancelButton: true,
                    cancelButtonText: "Medyaya geri dön",
                    focusCancel: true,
                }).then((res) => {
                    if (res.isConfirmed) {
                        setBase64Data([]);
                    }
                });
            }
        };

        document.addEventListener("keydown", handleEscKey);

        // Temizleme işlemi
        return () => {
            document.removeEventListener("keydown", handleEscKey);
        };
    }, [base64Data]);

    useEffect(() => {
        const chatdiv = document.getElementById("chatdiv");
        const handleScroll = () => {
            const currentHeight = chatdiv.scrollTop;

            if (currentHeight === 0) {
                setOffset(offset + limit);
                setScrollOffset(offset);
            } else {
                setScrollHeight(chatdiv.scrollHeight);
            }
        };
        chatdiv.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [offset]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];

        if (file) {
            const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB

            if (file.size > maxSizeInBytes) {
                setErr({ message: "Dosya boyutu 10 MB'dan büyük." });
            } else {
                const base64File = await convertFileToBase64(file);
                setBase64Data([
                    ...base64Data,
                    {
                        mediaType: file.type,
                        data: base64File,
                        filename: file.name,
                    },
                ]);
            }
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };
    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB
        const newBase64Data = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            // Aynı filename'e sahip dosyaları kontrol et
            if (
                base64Data.some(
                    (existingFile) => existingFile.filename === file.name
                )
            ) {
                continue; // Dosyayı eklemeyi durdur ve bir sonraki dosyaya geç
            }

            if (file.size > maxSizeInBytes) {
                Swal.fire({
                    title: "Bir veya daha fazla dosyanın boyutu 10 MB'dan büyük. Bu dosyalar eklenmedi.",
                    icon: "warning",
                    confirmButtonText: "Tamam",
                });
            } else {
                const base64File = await convertFileToBase64(file);

                newBase64Data.push({
                    mediaType: file.type,
                    data: base64File,
                    filename: file.name,
                });
            }
        }

        setBase64Data([...base64Data, ...newBase64Data]);
    };

    async function convertFileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const base64String = reader.result.split(",")[1];
                resolve(base64String);
            };

            reader.onerror = (error) => {
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    }

    const chatRemove = () => {
        setSelectedPhone("");
        setMessages([]);
        setCurrentCustomer(null);
        setSelectedMessage(null);
        setBase64Data([]);
    };

    return (
        <div className="flex h-screen">
            <audio ref={audioPlayer} src={NotificationSound} />
            <div className="w-1/4 flex flex-col h-screen bg-[white] text-[black] border-r border-[#222a2f]">
                <div className="flex items-center mb-4 p-4 bg-[white] border-none">
                    <div className="text-xl font-semibold flex flex-row">
                        Yetkilendirme
                    </div>
                    <input
                        type="checkbox"
                        className="ml-2"
                        onChange={() => {
                            setUserAccess(!userAccess);
                        }}
                    />
                    <input
                        type="text"
                        className="max-w-[5rem] mx-1"
                        onChange={(e) => {
                            setUserAccessUsername(e.target.value);
                        }}
                    />
                    <button onClick={handleAccessFetch}>OK</button>
                    <div className="ml-6">
                        <QRModal
                            qr={qr}
                            open={qrModalOpen}
                            setOpen={setQrModalOpen}
                        />
                    </div>
                </div>
                <div className="px-4 py-1 flex flex-col bg-[white] text-[black]">
                    <div className="ml-2 mb-4">
                        <p className="font-bold text tracking-widest text-xl">
                            FILTERS
                        </p>
                        <div className="flex mt-1 gap-4">
                            <label className="flex gap-2 justify-center items-center">
                                <input
                                    type="checkbox"
                                    onChange={() => {
                                        setHasFixedFilter(!hasFixedFilter);
                                        setSelectedPhone(null);
                                    }}
                                />
                                <p>Çözülmeyenler</p>
                            </label>

                            <FormControl fullWidth>
                                <InputLabel id="dropdown-label">
                                    Seçenek
                                </InputLabel>
                                <Select
                                    labelId="dropdown-label"
                                    id="dropdown"
                                    label="Seçenek"
                                    value={selectedTopic} // value prop'unu durumla senkronize edin
                                    onChange={(e) =>
                                        setSelectedTopic(e.target.value)
                                    }
                                >
                                    <MenuItem key="defaulttopic" value={0}>
                                        Hepsi
                                    </MenuItem>
                                    {topicOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel id="dropdown-label">
                                    Seçenek
                                </InputLabel>
                                <Select
                                    labelId="dropdown-label"
                                    id="dropdown"
                                    label="Seçenek"
                                    value={selectedSubTopic}
                                    onChange={(e) => {
                                        setSelectedSubTopic(
                                            () => e.target.value
                                        );
                                    }}
                                >
                                    <MenuItem key={"defaultsubtopic"} value={0}>
                                        Hepsi
                                    </MenuItem>
                                    {subTopicOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        <div className="flex gap-2 mt-5 w-full">
                            <label className="flex-shrink-0 max-w-[10rem]">
                                <p className="text-sm">Başlangıç Tarihi</p>
                                <DatePicker
                                    className="bg-white text-black w-full border border-black rounded-lg"
                                    placeholderText="GG/AA/YYYY"
                                    selected={
                                        firstDateFilter &&
                                        new Date(firstDateFilter)
                                    }
                                    onChange={(date) =>
                                        setFirstDateFilter(
                                            date !== null
                                                ? date.toISOString()
                                                : null
                                        )
                                    }
                                    dateFormat="dd/MM/yyyy"
                                />
                            </label>
                            <label className="flex-shrink-0 max-w-[10rem]">
                                <p className="text-sm">Bitis Tarihi</p>
                                <DatePicker
                                    placeholderText="GG/AA/YYYY"
                                    className="bg-white text-black w-full border border-black rounded-lg"
                                    selected={
                                        secondDateFilter &&
                                        new Date(secondDateFilter)
                                    }
                                    onChange={(date) =>
                                        setSecondDateFilter(
                                            date !== null
                                                ? date.toISOString()
                                                : null
                                        )
                                    }
                                    dateFormat="dd/MM/yyyy"
                                />
                            </label>
                        </div>
                    </div>
                    <div className="bg-[white] p-2 rounded-full flex items-center border-2">
                        <svg
                            className="w-6 h-6 text-gray-500 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M21 21l-6-6m0 0l-6-6m6 6l-6 6m6-6L3 3m6 6l6 6M3 3l6 6m10 2l2-2-6-6-2 2"
                            ></path>
                        </svg>
                        <input
                            type="text"
                            className="w-full bg-transparent focus:outline-none"
                            placeholder="Aratın veya yeni sohbet başlatın (90...)"
                            onKeyDown={(e) => handleFilterInputKeyPress(e)}
                            onChange={(e) => {
                                setTextFilter(e.target.value);
                                setSearchedAndSelectedMessageId(null);
                            }}
                        />
                    </div>
                </div>
                <div className="mt-4 overflow-y-auto">
                    {customers && customers.length > 0 && (
                        <h1
                            style={{
                                paddingLeft: "5%",
                            }}
                        >
                            Kişiler
                        </h1>
                    )}
                    {filteredCustomers &&
                        filteredCustomers.map((customer, index) => (
                            <Contact
                                key={index}
                                customer={customer}
                                setSelectedPhone={setSelectedPhone}
                                selectedPhone={selectedPhone}
                                setCurrentCustomer={setCurrentCustomer}
                                setMessages={setMessages}
                            />
                        ))}
                    {!filteredCustomers &&
                        customers &&
                        customers.map((customer, index) => (
                            <Contact
                                key={index}
                                customer={customer}
                                setSelectedPhone={setSelectedPhone}
                                selectedPhone={selectedPhone}
                                setCurrentCustomer={setCurrentCustomer}
                                setMessages={setMessages}
                            />
                        ))}
                    {customers &&
                        searchedMessagesForUserBar &&
                        searchedMessagesForUserBar.filter((item) =>
                            item.message
                                .toLowerCase()
                                .includes(textFilter.toLowerCase())
                        ).length > 0 && (
                            <div>
                                <h1
                                    style={{
                                        paddingLeft: "5%",

                                        marginBottom: "5%",
                                    }}
                                >
                                    Mesajlar
                                </h1>
                                {searchedMessagesForUserBar &&
                                    searchedMessagesForUserBar.length > 0 &&
                                    searchedMessagesForUserBar.map(
                                        (item, index) => {
                                            if (
                                                item.message
                                                    .toLowerCase()
                                                    .includes(
                                                        textFilter.toLowerCase()
                                                    )
                                            )
                                                return (
                                                    <Grid
                                                        container
                                                        key={index}
                                                        sx={{
                                                            marginTop: "2%",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => {
                                                            setSelectedPhone(
                                                                item.customer
                                                                    .phoneNumber
                                                            );
                                                            setSearchedAndSelectedMessageId(
                                                                item.id
                                                            );

                                                            const ids = [];
                                                            if (
                                                                !messages.some(
                                                                    (item) =>
                                                                        item.id ===
                                                                        searchedAndSelectedMessageId
                                                                )
                                                            ) {
                                                                setOffset(
                                                                    offset +
                                                                        limit
                                                                );
                                                                setScrollOffset(
                                                                    offset
                                                                );
                                                            }

                                                            searchedMessagesForUserBar.forEach(
                                                                (message) => {
                                                                    if (
                                                                        message.phoneNumber ===
                                                                        item.phoneNumber
                                                                    ) {
                                                                        ids.push(
                                                                            message.id
                                                                        );
                                                                    }
                                                                }
                                                            );
                                                            setSearchedAndSelectedMessageIdList(
                                                                ids
                                                            );

                                                            setTimeout(() => {
                                                                findMessageRef.current?.scrollIntoView(
                                                                    {
                                                                        behavior:
                                                                            "smooth",
                                                                    }
                                                                );

                                                                setNewMessageForSlider(
                                                                    false
                                                                );
                                                            }, 200);
                                                        }}
                                                    >
                                                        <Grid item xs={6}>
                                                            <Typography
                                                                sx={{
                                                                    color: "black",
                                                                    fontWeight:
                                                                        "700",
                                                                    paddingLeft:
                                                                        "5%",
                                                                }}
                                                            >
                                                                {item.customer
                                                                    ?.username ||
                                                                    `+${item.customer?.phoneNumber.replace(
                                                                        /(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})/,
                                                                        "$1 $2 $3 $4 $5"
                                                                    )}`}{" "}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            xs={6}
                                                            sx={{
                                                                justifyContent:
                                                                    "flex-end",
                                                                display: "flex",
                                                                paddingRight:
                                                                    "3%",
                                                            }}
                                                        >
                                                            <Typography>
                                                                {formatDate(
                                                                    item.createdAt
                                                                )}{" "}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid
                                                            item
                                                            xs={12}
                                                            sx={{
                                                                paddingLeft:
                                                                    "10%",
                                                            }}
                                                        >
                                                            <Highlighter
                                                                searchWords={[
                                                                    textFilter,
                                                                ]}
                                                                style={{
                                                                    color: "gray",
                                                                    paddingTop:
                                                                        "1%",
                                                                }}
                                                                autoEscape={
                                                                    true
                                                                }
                                                                highlightStyle={{
                                                                    color: "green",
                                                                    background:
                                                                        "transparent",
                                                                    fontWeight:
                                                                        "700",
                                                                }}
                                                                textToHighlight={
                                                                    (item.message.indexOf(
                                                                        textFilter
                                                                    ) -
                                                                        25 >
                                                                    0
                                                                        ? "..."
                                                                        : "") +
                                                                    item.message.slice(
                                                                        Math.max(
                                                                            0,
                                                                            item.message.indexOf(
                                                                                textFilter
                                                                            ) -
                                                                                25
                                                                        ),
                                                                        item.message.indexOf(
                                                                            textFilter
                                                                        ) +
                                                                            textFilter.length +
                                                                            25
                                                                    ) +
                                                                    (item.message.indexOf(
                                                                        textFilter
                                                                    ) +
                                                                        textFilter.length +
                                                                        25 <
                                                                    item.message
                                                                        .length
                                                                        ? "..."
                                                                        : "")
                                                                }
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                );
                                        }
                                    )}
                            </div>
                        )}
                </div>
            </div>
            <div className="w-3/4 h-full flex flex-col relative">
                <div className="flex items-center justify-between bg-[white] border-none text-[black] p-4 border-b">
                    <div className="flex items-center">
                        <img
                            src={
                                customers?.find(
                                    (item) => item.id === currentCustomer
                                )?.profilePic ||
                                "https://static.vecteezy.com/system/resources/previews/020/911/740/original/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"
                            }
                            alt="Profile"
                            style={{
                                width: "40px",
                                display: currentCustomer ? "flex" : "none",
                            }}
                            className="rounded-full mr-2"
                        />
                        <div className="font-semibold">
                            {customers?.find(
                                (item) => item.id === currentCustomer
                            )?.username ||
                                customers?.find(
                                    (item) => item.id === currentCustomer
                                )?.pushname ||
                                selectedPhone}
                        </div>
                    </div>
                    <div className="flex items-center h-10">
                        {selectedPhone && (
                            <div
                                className="flex "
                                style={{ alignItems: "center" }}
                            >
                                <button
                                    onClick={handleAllMessageFixed}
                                    className="flex gap-2 p-2 mx-4 items-center justify-center text-[black] hover:bg-[#F1EFEF] rounded-lg"
                                >
                                    Sorunlar çözüldü
                                </button>
                                <div
                                    className="hover:bg-[#F1EFEF] rounded-lg p-2"
                                    onClick={chatRemove}
                                >
                                    <svg
                                        className="w-6 h-6 text-[#aebac1] cursor-pointer"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        ></path>
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div
                    id={"chatdiv"}
                    className="flex-1 p-4 overflow-y-auto"
                    style={{ backgroundImage: `url("/img/bg.png")` }}
                    onDragOver={(e) => {
                        if (selectedPhone) {
                            handleDragOver(e);
                        }
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                        if (selectedPhone) {
                            handleDrop(e);
                        }
                    }}
                >
                    {isDragOver && (
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                height: "100%",
                                width: "100%",
                                transform: "translate(-50%, -50%)",
                                opacity: 0.6,
                                zIndex: 1000,
                                backgroundColor: "gray",
                                alignItems: "center",
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "row",
                            }}
                        >
                            <Icon path={mdiFileUpload} size={4} />
                            <Typography
                                sx={{
                                    color: "black",
                                    opacity: 1,
                                    fontSize: "24px",
                                    fontWeight: "700",
                                }}
                            >
                                Dosyayı buraya sürükleyin ve bırakın
                            </Typography>
                            b
                        </div>
                    )}
                    {messages &&
                        messages.map((message, index) => (
                            <div
                                key={index}
                                ref={(element) => {
                                    if (
                                        message.id ===
                                        searchedAndSelectedMessageId
                                    ) {
                                        findMessageRef.current = element;
                                    }
                                    if (index === messages.length - 1) {
                                        lastMessageRef.current = element;
                                    }
                                }}
                            >
                                <Message
                                    hasFixedFilter={hasFixedFilter}
                                    selectedTopic={selectedTopic}
                                    selectedSubTopic={selectedSubTopic}
                                    message={message}
                                    selectedMessage={selectedMessage}
                                    setSelectedMessage={setSelectedMessage}
                                    topicOptions={topicOptions}
                                    subTopicOptions={subTopicOptions}
                                />
                            </div>
                        ))}
                </div>
                <button
                    className={`absolute bottom-28 right-10 rounded-full bg-[#202c33] w-12 h-12 shadow-lg shadow-[#202c33] ${
                        scrollOffset > 0 ? "visible" : "invisible"
                    }`}
                    onClick={() => setScrollIntoView(true)}
                >
                    <svg
                        className="svg-icon font-thin -rotate-90"
                        viewBox="-1.5 -2.5 25 25"
                    >
                        <path
                            fill="white"
                            d="M8.388,10.049l4.76-4.873c0.303-0.31,0.297-0.804-0.012-1.105c-0.309-0.304-0.803-0.293-1.105,0.012L6.726,9.516c-0.303,0.31-0.296,0.805,0.012,1.105l5.433,5.307c0.152,0.148,0.35,0.223,0.547,0.223c0.203,0,0.406-0.08,0.559-0.236c0.303-0.309,0.295-0.803-0.012-1.104L8.388,10.049z"
                        ></path>
                    </svg>
                </button>
                {base64Data.length > 0 && (
                    <div
                        style={{
                            zIndex: "1000",
                            backgroundImage: `url("/img/bg.png")`,
                            position: "absolute",
                            bottom: 10,
                        }}
                    >
                        <div
                            style={{
                                width: "40vw",
                                height: "20vh",
                                backgroundColor: "white",
                                marginLeft: "2%",
                                opacity: "0.85",
                                padding: "2%",
                                borderRadius: "5px",
                                flexDirection: "column",
                                display: "flex",
                                justifyContent: "space-around",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    width: "39vw",
                                    overflow: "auto",
                                }}
                            >
                                {base64Data.map((data) => (
                                    <div
                                        key={data.filename}
                                        style={{
                                            display: "flex",
                                            alignItems: "baseline",
                                        }}
                                    >
                                        <MediaModalForInputBar file={data} />
                                        <div
                                            className="hover:bg-[#F1EFEF] rounded-lg "
                                            onClick={() => removeFile(data)}
                                        >
                                            <svg
                                                className="w-6 h-6 text-[#aebac1] cursor-pointer"
                                                fill="none"
                                                stroke="black"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                ></path>
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center">
                                <textarea
                                    onKeyDown={(e) => handleKeyPress(e)}
                                    rows={1}
                                    value={newMessage}
                                    onChange={(e) =>
                                        setNewMessage(e.target.value)
                                    }
                                    style={{ border: "1px solid gray" }}
                                    className="flex-1 resize-none bg-[white] text-[black] rounded p-2 mr-2 focus:outline-none"
                                    placeholder="Mesaj yaz..."
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="bg-green-500 text-[black] px-4 py-2 rounded"
                                >
                                    Gönder
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-[whitesmoke] p-4">
                    {selectedPhone && base64Data.length === 0 && (
                        <div className="flex items-center">
                            <textarea
                                onKeyDown={(e) => handleKeyPress(e)}
                                rows={1}
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                className="flex-1 resize-none bg-[white] text-[black] rounded p-2 mr-2 focus:outline-none"
                                placeholder="Mesaj yaz..."
                            />
                            <button
                                onClick={handleSendMessage}
                                className="bg-green-500 text-[black] px-4 py-2 rounded"
                            >
                                Gönder
                            </button>
                            <label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                />
                                <svg
                                    htmlFor="fileInput"
                                    className="w-10 h-10 pl-2 ml-2 cursor-pointer text-black"
                                    fill="white"
                                    stroke="black"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 5v.01M12 12v.01M12 19v.01M5 12h.01M12 12l-6 6m6-6l6 6"
                                    ></path>
                                </svg>
                            </label>
                            {err && <p>{err.message}</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
