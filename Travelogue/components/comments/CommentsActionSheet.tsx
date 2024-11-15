import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Image, KeyboardAvoidingView, Platform, Animated, TouchableOpacity, Alert, Modal } from 'react-native'
import React, { useState, RefObject, useRef, useEffect } from 'react'
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { Divider } from 'react-native-paper'
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { CommentType, Comment, RatingComment } from '@/types/CommentTypes';
import { Rating } from 'react-native-ratings';
import { database, get, onValue, push, ref, update } from '@/firebase/firebaseConfig';
import { MaterialIcons } from '@expo/vector-icons';

// Extending Comment to create SortedComment with extra fields
interface SortedComment extends Comment {
    replies?: SortedComment[];
    indentationLevel?: number;
}
interface SortedCommentsProps {
    comments: Record<string, SortedComment>;
}

interface CommentsActionSheetProps {
    commentRefAS: RefObject<ActionSheetRef>;
    isPostAuthor?: boolean;
    commentsData: SortedComment[];
    onSubmitComment?: (parentComment: Comment, replyText: string) => void;
    onDelete?: (item: SortedComment) => void;
    onReport?: (item: SortedComment) => void;
    accountId?: string;
    postId?: string;
}
// Function to sort and nest comments
function sortAndNestComments(comments: Record<string, SortedComment>): SortedComment[] {
    // Initialize a map to store comments by ID, with empty replies initialized
    const commentsById: Record<string, SortedComment> = Object.keys(comments).reduce((acc, key) => {
        acc[key] = { ...comments[key], replies: [] };
        return acc;
    }, {} as Record<string, SortedComment>);

    const sortedComments: SortedComment[] = [];

    // Loop through the comments directly
    Object.values(comments).forEach((comment) => {
        if (comment.parentId) {
            // If the comment has a parent, push it into the parent's replies array
            if (commentsById[comment.parentId]) {
                commentsById[comment.parentId].replies!.push(comment);
            }
        } else {
            // If it’s a top-level comment, add it to sortedComments
            sortedComments.push(commentsById[comment.id]);
        }
    });

    return sortedComments;
}

// Function to flatten nested comments with indentation levels
function flattenComments(comments: SortedComment[], level = 0): SortedComment[] {
    const flatList: SortedComment[] = [];

    comments.forEach((comment) => {
        flatList.push({ ...comment, indentationLevel: level });

        if (comment.replies && comment.replies.length > 0) {
            flatList.push(...flattenComments(comment.replies, level + 1));
        }
    });

    return flatList;
}


export default function CommentsActionSheet(props: CommentsActionSheetProps) {
    const [replyText, setReplyText] = useState("");
    const [selectedComment, setSelectedComment] = useState<SortedComment | null>(null);
    const [longPressedComment, setLongPressedComment] = useState<SortedComment | null>(null);
    const [flatComments, setFlatComments] = useState<SortedComment[]>([]);
    const authorizedCommentAS = useRef<ActionSheetRef>(null);
    const unauthorizedCommentAS = useRef<ActionSheetRef>(null);
    // Animated value for fade-in effect
    const opacityAnim = useRef(new Animated.Value(0)).current;


    //report 
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [reasonsPost, setReasonsPost] = useState([])
    const [dataReason, setDataReason] = useState([])
    const [typeReport, setTypeReport] = useState('')
    const [idPost, setIdPost] = useState('')
    const [idComment, setIdComment] = useState('')
    const [reasonsComment, setReasonsComment] = useState([])

    const handleReplyButtonPress = (item: SortedComment) => {
        setSelectedComment(item);
    };
    const handleCancelReply = () => {
        setSelectedComment(null);
        setReplyText("");

    };
    const handleReplySubmit = () => {

        if (replyText) {
            if (props.onSubmitComment) {
                props.onSubmitComment(selectedComment as Comment, replyText);

            }
            setReplyText("");
            setSelectedComment(null);

        }

    };
    const handleLongPress = (comment: SortedComment) => {
        if (props.accountId === comment.author.id) {
            setLongPressedComment(comment);
            authorizedCommentAS.current?.show();
        } else {
            setLongPressedComment(comment);
            unauthorizedCommentAS.current?.show();
        }
    }
    const handleDeleteComment = (comment: SortedComment) => {
        if (props.onDelete && comment) {
            props.onDelete(comment);
            authorizedCommentAS.current?.hide();
        }
    }

    // Reason comment
    useEffect(() => {
        // Lắng nghe dữ liệu từ Firebase Realtime Database theo thời gian thực
        const onValueChange = ref(database, 'reasons/comment/');
        // Lắng nghe thay đổi trong dữ liệu
        const reason = onValue(onValueChange, (snapshot) => {
            if (snapshot.exists()) {
                const jsonData = snapshot.val();
                // Chuyển đổi object thành array
                const dataArray: any = Object.entries(jsonData).map(([key, value]) => ({
                    id: key,
                    name: value,
                }));
                setReasonsComment(dataArray);
            } else {
                console.log("No data available");
            }
        }, (error) => {
            console.error("Error fetching data:", error);
        });

        // Cleanup function để hủy listener khi component unmount
        return () => reason();
    }, []);


    const handleReport = (reason: any) => {
        setSelectedReason(reason);
        setModalVisible(false);
        setShowConfirmation(true);
        setTimeout(() => {
            setShowConfirmation(false);
        }, 3000);

        reportComment(reason)

    };


    const reportComment = async (reason: any) => {
        let item: any = {
            reason: {

            }
        }
        const reportRef = ref(database, `reports/comment/${idComment}`);
        // Tạo key tu dong cua firebase
        const newItemKey = push(ref(database, `reports/comment/${idComment}/reason/`));
        const snapshot = await get(reportRef);
        if (snapshot.exists()) {
            item = snapshot.val();

        }
        const reasonKey = newItemKey.key as string;
        const itemNew = {
            id: idComment,
            post_id: idPost,
            reason: {
                ...item.reason,
                [reasonKey]: reason
            },
            status: 1
        }
        await update(reportRef, itemNew)
            .then(() => {
                console.log('Data added successfully');
            })
            .catch((error) => {
                console.error('Error adding data: ', error);
            });

    };

    const handlePressReport = (comment: SortedComment) => {
        setModalVisible(true)
        setDataReason(reasonsComment)
        setIdComment(comment.id)
        setTypeReport("comment")
        unauthorizedCommentAS.current?.hide();

    }

    // Animate opacity when replyText changes
    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: replyText ? 1 : 0, // Fade in out
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [replyText]);

    // Prepare sorted and flattened comments
    useEffect(() => {
        const nestedComments = sortAndNestComments(props.commentsData.reduce((acc, comment) => {
            acc[comment.id] = comment;
            return acc;
        }, {} as Record<string, SortedComment>));

        const flattened = flattenComments(nestedComments);

        setFlatComments(flattened);
    }, [props.commentsData]);

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <ActionSheet
                ref={props.commentRefAS}
                containerStyle={styles.ratingCommentsASContainer}
            >
                <View  >
                    <View style={styles.topBorder}></View>
                    <Text style={styles.ratingCommentsHeader}>Bình luận</Text>
                    <Divider style={styles.marginBottom5} />
                    {/* Input and Reply Button for Post Owner */}
                    {/* {props.isPostAuthor && ( */}
                    <View style={styles.replyInputContainer}>
                        {selectedComment && (
                            <View style={styles.mentionContainer}>
                                <Text style={styles.mentionText}>@{selectedComment.author.fullname}</Text>
                                <TouchableOpacity onPress={handleCancelReply} style={styles.cancelMentionButton}>
                                    <IconMaterial name="close-circle" size={16} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        )}
                        <TextInput
                            placeholder="Aa"
                            value={replyText}
                            onChangeText={setReplyText}
                            style={styles.replyInput}
                            multiline
                        />

                        {/* Animated Send Button */}

                        {replyText.length > 0 && (
                            <Animated.View style={[styles.replySubmitButton, { opacity: opacityAnim }]}>
                                <TouchableOpacity onPress={handleReplySubmit}>
                                    <IconMaterial name='send' style={styles.replySubmitButtonText} />
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>

                    {/* )} */}
                    {props.commentsData.length > 0 ? (
                        <FlatList
                            data={flatComments}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.ratingCommentCard, { marginLeft: item.indentationLevel ? item.indentationLevel * 30 : 0 }]}
                                    onLongPress={() => handleLongPress(item)}
                                >
                                    <View style={styles.ratingCommentHeader}>
                                        <Image
                                            source={{ uri: item.author.avatar }}
                                            style={styles.ratingCommentAvatar}
                                        />
                                        <View style={styles.ratingCommentUserInfo}>
                                            <Text style={styles.ratingCommentAuthor}>
                                                {item.author.fullname}
                                            </Text>
                                            <Text style={styles.ratingCommentTime}>
                                                {item.created_at}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={styles.ratingCommentText}>{item.content}</Text>
                                    {!item.parentId && (
                                        <Pressable

                                            style={styles.replyButtonContainer}
                                            onPress={() => handleReplyButtonPress(item)}
                                        >
                                            <IconMaterial name="message-reply-text-outline" size={20} color="#5a5a5a" />
                                            <Text style={styles.replyButtonText}>Reply</Text>
                                        </Pressable>
                                    )}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={{ paddingBottom: 120 }}
                        />
                    ) : (
                        <Text style={styles.noCommentsText}>No comments yet.</Text>
                    )}

                </View>
            </ActionSheet>
            {/* Action Sheet for author*/}
            <ActionSheet ref={authorizedCommentAS} containerStyle={styles.actionSheetContainer}>
                <View>
                    <TouchableOpacity
                        style={styles.actionOption}
                        onPress={() => {
                            if (longPressedComment) {
                                handleDeleteComment(longPressedComment);
                            }

                        }}
                    >
                        <Text style={[styles.actionOptionText, styles.actionOptionTextDelete]}>
                            Xóa bình luận
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionOption}
                        onPress={() => authorizedCommentAS.current?.hide()}
                    >
                        <Text style={[styles.actionOptionText, styles.actionOptionTextCancel]}>
                            Hủy
                        </Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>

            {/* Action Sheet for unauthorized account */}
            <ActionSheet ref={unauthorizedCommentAS} containerStyle={styles.actionSheetContainer}>
                <View>
                    <TouchableOpacity
                        style={styles.actionOption}
                        onPress={() => {
                            if (longPressedComment) {
                                handlePressReport(longPressedComment);

                            }

                        }}
                    >
                        <Text style={[styles.actionOptionText, styles.actionOptionTextDelete]}>
                            Báo cáo bình luận
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionOption}
                        onPress={() => unauthorizedCommentAS.current?.hide()}
                    >
                        <Text style={[styles.actionOptionText, styles.actionOptionTextCancel]}>
                            Hủy
                        </Text>
                    </TouchableOpacity>
                </View>
            </ActionSheet>
            {/* Report Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select a reason for report</Text>
                        <FlatList
                            data={dataReason}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={(item: any) => (
                                <TouchableOpacity
                                    style={styles.reasonItem}
                                    onPress={() => handleReport(item.item.name)}
                                >
                                    <Text style={styles.reasonText}>{item.item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                            <MaterialIcons name="cancel" size={24} color="red" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Confirmation message */}
            {showConfirmation && (
                <View style={styles.confirmationBox}>
                    <Text style={styles.confirmationText}>Your report has been submitted!</Text>
                </View>
            )}
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    reasonItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        width: '100%',
    },
    reasonText: {
        fontSize: 16,
    },
    confirmationBox: {
        position: 'absolute',
        bottom: 30,
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        alignSelf: 'center',
    },
    confirmationText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    actionSheetContainer: {
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    actionOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
    },
    actionOptionText: {
        fontSize: 18,
        color: '#007AFF',
        fontWeight: '500',
        textAlign: 'center',
    },
    actionOptionTextDelete: {
        color: '#FF3B30', // Red color for delete option
    },
    actionOptionTextCancel: {
        color: '#555555', // Grey color for cancel option
    },
    mentionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f4fc',
        padding: 5,
        borderRadius: 8,
        marginRight: 10,
    },
    mentionText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    cancelMentionButton: {
        marginLeft: 5,
    },
    replyInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 10,
        marginTop: 15,

    },
    replyInput: {
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    replySubmitButton: {
        backgroundColor: "transparent",
        paddingRight: 5,
        paddingLeft: 10,
        paddingVertical: 8,
        borderRadius: 10,
        marginLeft: 10,
    },
    replySubmitButtonText: {
        color: '#007AFF',
        fontWeight: '500',
        fontSize: 25,
    },
    replyButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    replyButtonText: {
        color: '#5a5a5a',
        fontSize: 14,
        marginLeft: 5,
    },
    marginBottom5: {
        marginBottom: 5,
    },
    topBorder: {
        borderTopWidth: 3,
        borderTopColor: '#B1B1B1',
        width: 50,
        alignSelf: 'center',
        paddingVertical: 5
    },
    ratingCommentsASContainer: {
        backgroundColor: '#f6f6f6',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 15,
        height: '80%',
    },
    ratingCommentsHeader: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    ratingCommentCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        paddingLeft: 20,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    ratingCommentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingCommentAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    ratingCommentUserInfo: {
        flexDirection: 'column',
    },
    ratingCommentAuthor: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    ratingCommentTime: {
        fontSize: 12,
        color: '#999',
    },
    ratingCommentText: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10,
    },
    ratingCommentImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        marginTop: 10,
        resizeMode: 'cover',
    },
    noCommentsText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
})