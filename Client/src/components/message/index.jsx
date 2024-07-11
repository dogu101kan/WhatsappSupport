/** @format */

import { useEffect, useRef, useState } from "react";
import Cookies from "universal-cookie";
import MediaModal from "../mediaModal";
import Popup from "../messagePopup/";
import parseVCard from "../../utils/parseVcard";

export const Message = ({
    message,
    setSelectedMessage,
    selectedMessage,
    topicOptions,
    subTopicOptions,
    hasFixedFilter,
    selectedTopic,
    selectedSubTopic,
}) => {
    const cookies = new Cookies();
    const [loading, setLoading] = useState(false);
    const [hasFixed, setHasFixed] = useState(message.hasFixed);
    const [hasMarked, setHasMarked] = useState(message.hasMarked);
    const [popUp, setPopUp] = useState(false);
    const [initialState, setInitialState] = useState(false);
    const [formData, setFormData] = useState({});
    const popUpRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popUpRef.current && !popUpRef.current.contains(event.target)) {
                setPopUp(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [popUp]);

    const checkboxFixedHandler = () => {
        setLoading(true);
        let url = apiURL + `/message/hasFixed/${message.id}`;

        let headers = new Headers();
        headers.append("authorization", "Bearer " + cookies.get("token"));

        fetch(url, {
            method: "GET",
            headers: headers,
        })
            .then((response) => response.json())
            .then((json) => {
                setLoading(false);
                setHasFixed(!hasFixed);
            })
            .catch((err) => {
                setLoading(false);
            });
    };

    const checkboxMarkedHandler = () => {
        if (message.id !== null) {
            setLoading(true);
            let url = apiURL + `/message/hasMarked/${message.id}`;

            let headers = new Headers();
            headers.append("authorization", "Bearer " + cookies.get("token"));

            fetch(url, {
                method: "GET",
                headers: headers,
            })
                .then((response) => response.json())
                .then((json) => {
                    setLoading(false);
                    setHasMarked(!hasMarked);
                })
                .catch((err) => {
                    setLoading(false);
                });
        }
    };

    useEffect(() => {
        if ((formData.date || formData.details) && initialState) {
            setLoading(true);
            let url = apiURL + `/message/messagedetails/${message.id}`;

            let headers = new Headers();

            headers.append("Content-Type", "application/json");
            headers.append("authorization", "Bearer " + cookies.get("token"));
            try {
                fetch(url, {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify(formData),
                })
                    .then((response) => response.json())
                    .then((json) => {
                        setLoading(false);
                        if (json.success === true) {
                        } else {
                        }
                    })
                    .catch(setLoading(false));
            } catch (error) {}
        }
        setInitialState(true);
    }, [formData]);

    return (
        <div
            className={`mb-4 ${
                message.userId !== null
                    ? "flex-row-reverse text-right "
                    : "flex-row text-left "
            }
            `}
        >
            {/* {console.log(message)} */}
            <div
                className={`p-4 rounded-lg shadow relative ${
                    message.userId !== null
                        ? "ml-auto bg-[#d9fdd3]"
                        : "bg-[white] right-0 top-0"
                } max-w-[30rem] min-w-[50px]`}
            >
                <div
                    ref={popUpRef}
                    className={`absolute ${
                        message.userId !== null ? "-left-52" : "-right-52"
                    } ${popUp ? "block" : "hidden"}`}
                    style={{ zIndex: 10 }}
                >
                    <Popup
                        message={message}
                        selectedMessage={selectedMessage}
                        setFormData={setFormData}
                        topicOptions={topicOptions}
                        subTopicOptions={subTopicOptions}
                    />
                </div>
                <div
                    className={`absolute top-2.5 ${
                        message.userId !== null ? "left-7" : "right-7"
                    }`}
                >
                    <svg
                        onClick={checkboxMarkedHandler}
                        id="hasMarked"
                        className="cursor-pointer"
                        width="16px"
                        height="16px"
                        viewBox="0 0 64 64"
                        enableBackground="new 0 0 64 64"
                        xmlSpace="preserve"
                    >
                        <path
                            stroke={hasMarked ? "" : "black"}
                            strokeWidth="3px"
                            fill={hasMarked ? "#e4ab4e" : "#FFFFFF"}
                            d="M62.799,23.737c-0.47-1.399-1.681-2.419-3.139-2.642l-16.969-2.593L35.069,2.265 C34.419,0.881,33.03,0,31.504,0c-1.527,0-2.915,0.881-3.565,2.265l-7.623,16.238L3.347,21.096c-1.458,0.223-2.669,1.242-3.138,2.642 c-0.469,1.4-0.115,2.942,0.916,4l12.392,12.707l-2.935,17.977c-0.242,1.488,0.389,2.984,1.62,3.854 c1.23,0.87,2.854,0.958,4.177,0.228l15.126-8.365l15.126,8.365c0.597,0.33,1.254,0.492,1.908,0.492c0.796,0,1.592-0.242,2.269-0.72 c1.231-0.869,1.861-2.365,1.619-3.854l-2.935-17.977l12.393-12.707C62.914,26.68,63.268,25.138,62.799,23.737z"
                        />
                    </svg>
                </div>
                <div
                    className={`w-5 h-5 rotate-90 absolute cursor-pointer top-2 ${
                        message.userId !== null ? "left-0.5" : "right-0.5"
                    }`}
                    onClick={(e) => {
                        setPopUp(!popUp);
                        setSelectedMessage(message.id);
                    }}
                >
                    <svg className="svg-icon" viewBox="0 0 20 20">
                        <path
                            fill="white"
                            stroke="black"
                            d="M3.936,7.979c-1.116,0-2.021,0.905-2.021,2.021s0.905,2.021,2.021,2.021S5.957,11.116,5.957,10
    S5.052,7.979,3.936,7.979z M3.936,11.011c-0.558,0-1.011-0.452-1.011-1.011s0.453-1.011,1.011-1.011S4.946,9.441,4.946,10
    S4.494,11.011,3.936,11.011z M16.064,7.979c-1.116,0-2.021,0.905-2.021,2.021s0.905,2.021,2.021,2.021s2.021-0.905,2.021-2.021
    S17.181,7.979,16.064,7.979z M16.064,11.011c-0.559,0-1.011-0.452-1.011-1.011s0.452-1.011,1.011-1.011S17.075,9.441,17.075,10
    S16.623,11.011,16.064,11.011z M10,7.979c-1.116,0-2.021,0.905-2.021,2.021S8.884,12.021,10,12.021s2.021-0.905,2.021-2.021
    S11.116,7.979,10,7.979z M10,11.011c-0.558,0-1.011-0.452-1.011-1.011S9.442,8.989,10,8.989S11.011,9.441,11.011,10
    S10.558,11.011,10,11.011z"
                        ></path>
                    </svg>
                </div>
                <div className="whitespace-normal text-[black]">
                    {message.hasMedia && <MediaModal message={message} />}
                    {message.message.includes("BEGIN:VCARD") ? (
                        <p style={{ flexDirection: "column", display: "flex" }}>
                            <span style={{}}>
                                {parseVCard(message.message).fn}
                            </span>
                            <span style={{ color: "blue", borderWidth: "700" }}>
                                {parseVCard(message.message).tel}
                            </span>
                        </p>
                    ) : message.message.includes("http") ? (
                        <p className="whitespace-pre-line">
                            <a
                                href={message.message.match(/http[^\s]+/)}
                                style={{ color: "blue" }}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {message.message.match(/http[^\s]+/)}
                            </a>
                            <span>
                                {message.message.replace(/(http[^\s]+)/, "")}
                            </span>
                        </p>
                    ) : (
                        <p className="whitespace-pre-line">{message.message}</p>
                    )}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                    {new Date(message.createdAt).toString().split("GMT")[0]}
                </div>
                {message.customerId !== null && (
                    <label className="flex items-center justify-end text-right text-sm gap-2 text-[#83939b] cursor-pointer">
                        Sorun Çözüldü
                        <input
                            type="checkbox"
                            onChange={checkboxFixedHandler}
                            checked={hasFixed}
                        />
                    </label>
                )}
            </div>
        </div>
    );
};
