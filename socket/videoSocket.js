const videoRooms = new Map();

function setupVideoSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // =====================================================
    // JOIN VIDEO ROOM
    // =====================================================

    socket.on("join-video-room", (data) => {
      try {
        const {
          meetingId,
          userId,
          userName,
          role,
        } = data || {};

        if (!meetingId) {
          console.log("Meeting ID missing");
          return;
        }

        socket.join(meetingId);

        socket.meetingId = meetingId;
        socket.userId = userId;
        socket.userName = userName;
        socket.role = role;

        console.log(
          `${role} joined room: ${meetingId}`
        );

        // Create room
        if (!videoRooms.has(meetingId)) {
          videoRooms.set(meetingId, []);
        }

        const participants =
          videoRooms.get(meetingId);

        // Add participant
        const exists = participants.some(
          (p) => p.socketId === socket.id
        );

        if (!exists) {
          participants.push({
            socketId: socket.id,
            userId,
            userName,
            role,
          });
        }

        // Existing participants
        const otherParticipants =
          participants.filter(
            (p) => p.socketId !== socket.id
          );

        // Tell existing user
        socket.to(meetingId).emit(
          "user-joined",
          {
            socketId: socket.id,
            userId,
            userName,
            role,
          }
        );

        // Patient joined
        if (role === "patient") {
          socket.to(meetingId).emit(
            "patient-joined",
            {
              socketId: socket.id,
              userId,
              userName,
              role,
            }
          );
        }

        // Send existing users
        socket.emit(
          "existing-participants",
          otherParticipants
        );

      } catch (error) {
        console.error(
          "Join video room error:",
          error
        );
      }
    });

    // =====================================================
    // WEBRTC OFFER
    // =====================================================

    socket.on(
      "webrtc-offer",
      ({ meetingId, offer }) => {
        if (!meetingId || !offer) return;

        socket.to(meetingId).emit(
          "webrtc-offer",
          {
            offer,
            from: socket.id,
          }
        );
      }
    );

    // =====================================================
    // WEBRTC ANSWER
    // =====================================================

    socket.on(
      "webrtc-answer",
      ({ meetingId, answer }) => {
        if (!meetingId || !answer) return;

        socket.to(meetingId).emit(
          "webrtc-answer",
          {
            answer,
            from: socket.id,
          }
        );
      }
    );

    // =====================================================
    // ICE CANDIDATE
    // =====================================================

    socket.on(
      "webrtc-ice-candidate",
      ({ meetingId, candidate }) => {
        if (!meetingId || !candidate) return;

        socket.to(meetingId).emit(
          "webrtc-ice-candidate",
          {
            candidate,
            from: socket.id,
          }
        );
      }
    );

    // =====================================================
    // CHAT MESSAGE
    // =====================================================

    socket.on(
      "video-chat-message",
      (data) => {
        const {
          meetingId,
          message,
          sender,
          role,
        } = data || {};

        if (!meetingId || !message) {
          return;
        }

        socket.to(meetingId).emit(
          "video-chat-message",
          {
            message,
            sender,
            role,
          }
        );
      }
    );

    // =====================================================
    // LEAVE ROOM
    // =====================================================

    socket.on(
      "leave-video-room",
      ({ meetingId }) => {
        if (!meetingId) return;

        socket.leave(meetingId);

        removeParticipant(
          socket,
          meetingId
        );

        socket.to(meetingId).emit(
          "user-left",
          {
            socketId: socket.id,
            role: socket.role,
          }
        );

        if (socket.role === "patient") {
          socket.to(meetingId).emit(
            "patient-left"
          );
        }
      }
    );

    // =====================================================
    // DISCONNECT
    // =====================================================

    socket.on("disconnect", () => {
      console.log(
        "Socket disconnected:",
        socket.id
      );

      if (!socket.meetingId) return;

      const meetingId =
        socket.meetingId;

      removeParticipant(
        socket,
        meetingId
      );

      socket.to(meetingId).emit(
        "user-left",
        {
          socketId: socket.id,
          role: socket.role,
        }
      );

      if (socket.role === "patient") {
        socket.to(meetingId).emit(
          "patient-left"
        );
      }
    });
  });
}

// =====================================================
// REMOVE PARTICIPANT
// =====================================================

function removeParticipant(
  socket,
  meetingId
) {
  if (!videoRooms.has(meetingId)) {
    return;
  }

  const participants =
    videoRooms.get(meetingId);

  const updated =
    participants.filter(
      (participant) =>
        participant.socketId !==
        socket.id
    );

  if (updated.length === 0) {
    videoRooms.delete(meetingId);
  } else {
    videoRooms.set(
      meetingId,
      updated
    );
  }
}

module.exports = setupVideoSocket;