/** @format */

import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { downloadFile } from "../../utils/mediaDownloader";
import FilePreviewer, { FilePreviewerThumbnail } from "react-file-previewer";
import FileViewer from "react-file-viewer";
import Icon from "@mdi/react";
import { mdiDownload } from "@mdi/js";
import { mdiFileWord } from "@mdi/js";

import { mdiFileExcel } from "@mdi/js";
const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    bgcolor: "background.paper",
    boxShadow: 24,
    maxHeight: "80vh", // Sayfaya sığacak şekilde maksimum yükseklik ayarlayın
    textAlign: "center",
    maxWidth: "80vw",
};

const MediaModal = ({ message }) => {
    const [open, setOpen] = useState(false);
    const [audio, setAudio] = useState();

    const handleOpen = (type) => {
        if (type.includes("pdf") || type.includes("image")) setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (
            message.file?.mediaType !== null &&
            message.file?.mediaType.split("/")[0] === "audio"
        ) {
            message.file?.mediaType.split("/")[0] === "audio";
            const base64String = message.file.media;
            const bytes = atob(base64String);
            const byteArray = new Uint8Array(bytes.length);

            for (let i = 0; i < bytes.length; i++) {
                byteArray[i] = bytes.charCodeAt(i);
            }

            const blob = new Blob([byteArray], {
                type: message.file?.mediaType,
            });
            setAudio(URL.createObjectURL(blob));
        }
    }, []);

    const handleDownload = (base64Data, fileName, fileType) => {
        downloadFile(base64Data, fileName, fileType);
    };

    return (
        <div className="inline-flex  ">
            <Button
                onClick={() => handleOpen(message.file?.mediaType)}
                style={{ textTransform: "none" }}
            >
                {message.file?.mediaType &&
                    message.file?.mediaType.split("/")[0] === "image" && (
                        <img
                            className="w-24"
                            style={{
                                border: "1px solid black",
                            }}
                            src={`data:${message.file?.mediaType};base64,${message.file?.media}`}
                        />
                    )}
                {audio && (
                    <audio controls>
                        <source src={audio} type={message.file?.mediaType} />
                    </audio>
                )}
                {((message.file?.mediaType &&
                    message.file?.mediaType.includes("pdf")) ||
                    message.file?.mediaType.includes("mp4")) && (
                    <div
                        style={{
                            border: "1px solid gray",
                            borderRadius: "5px",
                            maxHeight: "10vh",
                        }}
                    >
                        {message.file?.mediaType.includes("mp4") ? (
                            <FileViewer
                                fileType={
                                    message.file?.mediaType.includes("mp4")
                                        ? "mp4"
                                        : "pdf"
                                }
                                filePath={`data:${message.file.mediaType};base64,${message.file?.media}`}
                            />
                        ) : (
                            <FilePreviewerThumbnail
                                file={{
                                    url: `data:${message.file.mediaType};base64,${message.file?.media}`,
                                }}
                            />
                        )}
                    </div>
                )}
                {message.file?.mediaType &&
                    !message.file?.mediaType.includes("pdf") &&
                    !message.file?.mediaType.includes("image") &&
                    !message.file?.mediaType.includes("mp4") &&
                    !message.file?.mediaType.includes("mp3") && (
                        <div>
                            <button
                                style={{
                                    flexDirection: "row",
                                    display: "flex",
                                    alignItems: "flex-end",
                                }}
                                onClick={() =>
                                    handleDownload(
                                        message.file?.media,
                                        message.file?.messageId +
                                            "_" +
                                            message.file?.filename,
                                        message.file?.mediaType
                                    )
                                }
                            >
                                <Icon
                                    color={
                                        message.file?.mediaType.includes("word")
                                            ? "blue"
                                            : message.file?.filename.includes(
                                                  "xl"
                                              ) ||
                                              message.file?.filename.includes(
                                                  "csv"
                                              )
                                            ? "green"
                                            : "red"
                                    }
                                    path={
                                        message.file?.filename.includes("xl")
                                            ? mdiFileExcel
                                            : mdiFileWord
                                    }
                                    size={2}
                                />
                                <Icon
                                    color="black"
                                    path={mdiDownload}
                                    size={1.3}
                                />
                            </button>
                            <span style={{ color: "black" }}>
                                {message.file.filename}
                            </span>
                        </div>
                    )}
            </Button>

            <Modal open={open} onClose={handleClose}>
                <Box
                    sx={{
                        ...style,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        maxHeight: "100%",
                    }}
                >
                    <div style={{ overflow: "hidden", maxHeight: "100%" }}>
                        {message.file?.mediaType &&
                        message.file?.mediaType.includes("image") ? (
                            <img
                                style={{
                                    width: "50vw",
                                    maxHeight: "80vh",
                                    objectFit: "cover",
                                }}
                                src={`data:${message.file?.mediaType};base64,${message.file?.media}`}
                                alt="Media"
                            />
                        ) : message.file?.mediaType &&
                          message.file?.mediaType.includes("pdf") ? (
                            <iframe
                                style={{ width: "50vw", height: "80vh" }}
                                src={`data:${message.file.mediaType};base64,${message.file?.media}`}
                            />
                        ) : (
                            <p>Önizleme mevcut değil.</p>
                        )}
                    </div>
                </Box>
            </Modal>
        </div>
    );
};

export default MediaModal;
