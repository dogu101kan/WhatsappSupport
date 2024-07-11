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
import React from "react";
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

const MediaModalForInputBar = ({ file }) => {
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
            file?.mediaType !== null &&
            file?.mediaType.split("/")[0] === "audio"
        ) {
            file?.mediaType.split("/")[0] === "audio";
            const base64String = file.media;
            const bytes = atob(base64String);
            const byteArray = new Uint8Array(bytes.length);

            for (let i = 0; i < bytes.length; i++) {
                byteArray[i] = bytes.charCodeAt(i);
            }

            const blob = new Blob([byteArray], {
                type: file?.mediaType,
            });
            setAudio(URL.createObjectURL(blob));
        }
    }, []);
    return (
        <div className="inline-flex">
            <Button onClick={() => handleOpen(file?.mediaType)} style={{textTransform:"none"}}>
                {file?.mediaType &&
                    file?.mediaType.split("/")[0] === "image" && (
                        <img
                            className="w-24"
                            style={{
                                border: "1px solid black",
                            }}
                            src={`data:${file?.mediaType};base64,${file?.media}`}
                        />
                    )}
                {audio && (
                    <audio controls>
                        <source src={audio} type={file?.mediaType} />
                    </audio>
                )}
                {((file?.mediaType && file?.mediaType.includes("pdf")) ||
                    file?.mediaType.includes("mp4")) && (
                    <div
                        style={{
                            border: "1px solid gray",
                            borderRadius: "5px",
                            maxHeight: "10vh",
                        }}
                    >
                        {file?.mediaType.includes("mp4") ? (
                            <FileViewer
                                fileType={
                                    file?.mediaType.includes("mp4")
                                        ? "mp4"
                                        : "pdf"
                                }
                                filePath={`data:${file.mediaType};base64,${file?.media}`}
                            />
                        ) : (
                            <FilePreviewerThumbnail
                                file={{
                                    url: `data:${file.mediaType};base64,${file?.media}`,
                                }}
                            />
                        )}
                    </div>
                )}
                {file?.mediaType &&
                    !file?.mediaType.includes("pdf") &&
                    !file?.mediaType.includes("image") &&
                    !file?.mediaType.includes("mp4") &&
                    !file?.mediaType.includes("mp3") && (
                        <div>
                            {" "}
                            <Icon
                                color={
                                    file?.mediaType.includes("word")
                                        ? "blue"
                                        : file?.filename.includes("xl") ||
                                          file?.filename.includes("csv")
                                        ? "green"
                                        : "red"
                                }
                                path={
                                    file?.filename.includes("xl")
                                        ? mdiFileExcel
                                        : mdiFileWord
                                }
                                size={2}
                            />
                            <p style={{color:"black"}}>{file.filename}</p>
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
                        {file?.mediaType &&
                        file?.mediaType.includes("image") ? (
                            <img
                                style={{
                                    width: "50vw",
                                    maxHeight: "80vh",
                                    objectFit: "cover",
                                }}
                                src={`data:${file?.mediaType};base64,${file?.media}`}
                                alt="Media"
                            />
                        ) : file?.mediaType &&
                          file?.mediaType.includes("pdf") ? (
                            <iframe
                                style={{ width: "50vw", height: "80vh" }}
                                src={`data:${file.mediaType};base64,${file?.media}`}
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

export default MediaModalForInputBar;
