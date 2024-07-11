/** @format */

import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useState } from "react";

export const Contact = ({
    setSelectedPhone,
    selectedPhone,
    customer,
    setCurrentCustomer,
    setMessages,
}) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        border: "2px solid #000",
        boxShadow: 24,
        p: 4,
        maxHeight: "80vh",
        textAlign: "center",
        maxWidth: "80vw",
    };

    const handleChatClick = () => {
        if (selectedPhone === customer.phoneNumber) return;
        setSelectedPhone(customer.phoneNumber);
        setCurrentCustomer(customer.id);
        setMessages([]);
    };

    return (
        <div
            onClick={handleChatClick}
            className={`flex items-center relative cursor-pointer p-4 m-2 rounded-lg   hover:bg-[#F0F0F0] ${
                selectedPhone === customer.phoneNumber ? "bg-[#B6BBC4]" : ""
            }`}
        >
            <Button
                onClick={handleOpen}
                sx={{
                    borderRadius: "100%",
                }}
            >
                <img
                    className="w-12 h-12 rounded-full"
                    src={
                        customer.profilePic
                            ? customer.profilePic
                            : "https://static.vecteezy.com/system/resources/previews/020/911/740/original/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"
                    }
                />
            </Button>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box
                    sx={{
                        ...style,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        maxHeight: "100%",
                    }}
                >
                    <img
                        src={
                            customer.profilePic
                                ? customer.profilePic
                                : "https://static.vecteezy.com/system/resources/previews/020/911/740/original/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png"
                        }
                    />
                </Box>
            </Modal>
            <div className="w-full cursor-pointer relative ml-2">
                {customer.username ? (
                    <p className="font-bold text-lg">{customer.username}</p>
                ) : (
                    <p className="absolute right-0 top-0 text-xs text-[#6393a7]">
                        ~{customer.pushname}
                    </p>
                )}
                <p
                    className={
                        customer.username
                            ? `font-semibold text-xs`
                            : "font-bold"
                    }
                >
                    {customer.phoneNumber}
                </p>
            </div>
            {customer.notification && (
                <div className="w-2 h-2 rounded-full absolute bg-green-600 right-3"></div>
            )}
        </div>
    );
};
