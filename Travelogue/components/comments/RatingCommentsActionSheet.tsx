import { View, Text, StyleSheet, TextInput, FlatList, Pressable, Image, KeyboardAvoidingView, Platform, Animated, TouchableOpacity, Alert } from 'react-native'
import React, { useState, RefObject, useRef, useEffect } from 'react'
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { Divider } from 'react-native-paper'
import IconMaterial from "react-native-vector-icons/MaterialCommunityIcons";
import { CommentType, Comment, RatingComment } from '@/types/CommentTypes';
import { Rating } from 'react-native-ratings';


// Extending Comment to create SortedComment with extra fields
interface SortedComment extends RatingComment {
    replies?: SortedComment[];
    indentationLevel?: number;
}
interface SortedCommentsProps {
    comments: Record<string, SortedComment>;
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
interface RatingCommentsActionSheetProps {
    commentRefAS: RefObject<ActionSheetRef>;
    isPostAuthor: boolean;
    commentsData: RatingComment[];
    onSubmitRatingComment?: (parentComment: RatingComment, replyText: string) => void;
    onSubmitComment?: (parentComment: RatingComment, replyText: string) => void;
    onDelete?: (item: RatingComment) => void;
    onReport?: (item: RatingComment) => void;
    accountId?: string;
}

export default function RatingCommentsActionSheet(props: RatingCommentsActionSheetProps) {
    const [replyText, setReplyText] = useState("");
    const [selectedComment, setSelectedComment] = useState<RatingComment | null>(null);
    const [longPressedComment, setLongPressedComment] = useState<RatingComment | null>(null);
    const [flatRatingComments, setFlatRatingComments] = useState<SortedComment[]>([]);
    const authorizedCommentAS = useRef<ActionSheetRef>(null);
    const unauthorizedCommentAS = useRef<ActionSheetRef>(null);
    // Animated value for fade-in effect
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // Prepare sorted and flattened comments
    useEffect(() => {
        const nestedComments = sortAndNestComments(props.commentsData.reduce((acc, comment) => {
            acc[comment.id] = comment;
            return acc;
        }, {} as Record<string, SortedComment>));

        const flattened = flattenComments(nestedComments);
        setFlatRatingComments(flattened);
    }, [props.commentsData]);


    const handleReplyButtonPress = (item: RatingComment) => {
        setSelectedComment(item);
    };
    const handleCancelReply = () => {
        setSelectedComment(null);
        setReplyText("");

    };
    const handleReplySubmit = () => {

        if (replyText) {
            if (selectedComment && "rating" in selectedComment && props.onSubmitRatingComment) {
                props.onSubmitRatingComment(selectedComment as RatingComment, replyText);

            }

            setReplyText("");
            setSelectedComment(null);

        }

    };
    const handleLongPress = (comment: RatingComment) => {
        if (props.accountId === comment.author.id) {
            setLongPressedComment(comment);
            authorizedCommentAS.current?.show();
        } else {
            unauthorizedCommentAS.current?.show();
        }
    }
    const handleDeleteComment = (comment: RatingComment) => {
        if (props.onDelete && comment) {
            props.onDelete(comment);
            authorizedCommentAS.current?.hide();
        }
    }
    const handleReportComment = (comment: RatingComment) => {
        if (props.onReport && comment) {
            props.onReport(comment);
            unauthorizedCommentAS.current?.hide();
        }
    }


    // Animate opacity when replyText changes
    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: replyText ? 1 : 0, // Fade in out
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [replyText]);


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
                    <Text style={styles.ratingCommentsHeader}>Bình luận đánh giá</Text>
                    <Divider style={styles.marginBottom5} />
                    {/* Input and Reply Button for Post Owner */}
                    {props.isPostAuthor && (
                        <View style={styles.replyInputContainer}>
                            {selectedComment && (
                                <View style={styles.mentionContainer}>
                                    <Text style={styles.mentionText}>@{selectedComment.author.username}</Text>
                                    <Pressable onPress={handleCancelReply} style={styles.cancelMentionButton}>
                                        <IconMaterial name="close-circle" size={16} color="#FF3B30" />
                                    </Pressable>
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
                                    <Pressable onPress={handleReplySubmit}>
                                        <IconMaterial name='send' style={styles.replySubmitButtonText} />
                                    </Pressable>
                                </Animated.View>
                            )}
                        </View>

                    )}
                    {props.commentsData.length > 0 ? (
                        <FlatList
                            data={flatRatingComments}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <Pressable style={[styles.ratingCommentCard, { marginLeft: item.indentationLevel ? item.indentationLevel * 30 : 0 },]}
                                    onLongPress={() => handleLongPress(item)}
                                >
                                    <View style={styles.ratingCommentHeader}>
                                        <Image
                                            source={{ uri: item.author.avatar }}
                                            style={styles.ratingCommentAvatar}
                                        />
                                        <View style={styles.ratingCommentUserInfo}>
                                            <Text style={styles.ratingCommentAuthor}>
                                                {item.author.username}
                                            </Text>
                                            <Text style={styles.ratingCommentTime}>
                                                {item.created_at}
                                            </Text>
                                        </View>
                                    </View>
                                    {'rating' in item && item.rating != -1 && (
                                        <Rating
                                            readonly
                                            startingValue={item.rating}
                                            ratingBackgroundColor="#CDCDCD"
                                            imageSize={25}
                                            style={{ marginBottom: 10, alignItems: 'flex-start' }}
                                        />
                                    )}
                                    <Text style={styles.ratingCommentText}>{item.content}</Text>
                                    {'rating' in item && item.image && (
                                        <Image
                                            source={{ uri: item.image }}
                                            style={styles.ratingCommentImage}
                                        />
                                    )}
                                    {/* Conditionally show reply option for the post owner */}
                                    {props.isPostAuthor && (
                                        <Pressable

                                            style={styles.replyButtonContainer}
                                            onPress={() => handleReplyButtonPress(item)}
                                        >
                                            <IconMaterial name="message-reply-text-outline" size={20} color="#5a5a5a" />
                                            <Text style={styles.replyButtonText}>Reply</Text>
                                        </Pressable>
                                    )}
                                </Pressable>
                            )}
                            contentContainerStyle={{ paddingBottom: 120 }}
                        />
                    ) : (
                        <Text style={styles.noCommentsText}>No rating comments yet.</Text>
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
                                handleReportComment(longPressedComment);
                            }

                        }}
                    >
                        <Text style={[styles.actionOptionText, styles.actionOptionTextDelete]}>
                            Báo cáo bình luận
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
        </KeyboardAvoidingView>
    )
}
const styles = StyleSheet.create({
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