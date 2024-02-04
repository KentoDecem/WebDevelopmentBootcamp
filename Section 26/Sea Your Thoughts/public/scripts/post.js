$(".post-list > li").click(function () {
    if (!$(this).hasClass('editing')) {
        $(this).toggleClass("expanded");
        $(this).find("div").toggleClass("post-box-s");
        $(this).find(".tools").toggleClass("tools-active");
        $(this).find("b").toggleClass("b-pad-top");
        console.log("Click!!")
    }
})

$(".post-list .trash-button").click(function(event) {
    event.stopPropagation();
    var postId = $(this).closest('li').data("post-id");
    console.log("Trash button clicked for post ID:", postId);
    deletePost(postId);
});

$(".post-list .edit-button").click(async function(event) {
    event.stopPropagation();

    var $postItem = $(this).closest('li');
    $postItem.toggleClass('editing');

    $(this).toggleClass("edit-button-active");

    var postId = $(this).closest('li').data("post-id");

    var updatedTitle = $postItem.find('.title-content').text();
    var updatedPost = $postItem.find('.post-content').text();

    // Przełączanie contenteditable dla tytułu
    var $titleBox = $(this).closest('li').find('.title-content');
    $titleBox.prop('contenteditable', function(i, value) {
        return value === 'true' ? 'false' : 'true';
    });
    
    // Przełączanie contenteditable dla treści postu
    var $postBox = $(this).closest('li').find('.post-content');
    $postBox.prop('contenteditable', function(i, value) {
        return value === 'true' ? 'false' : 'true';
    });

    console.log("Edit button clicked for post ID:", postId);
    console.log("Updated title (HTML):", updatedTitle);
    console.log("Updated post (HTML):", updatedPost);

try {
        const response = await fetch(`http://localhost:3000/update/${postId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: updatedTitle,
                post: updatedPost
            })
        });
        if (response.ok) {
            const responseData = await response.json();
            const updatedIndex = responseData.updatedIndex;
            console.log("Post updated successfully at index:", updatedIndex);
            // Tutaj możesz zaimplementować kod do odświeżania widoku postów na stronie klienta
        } else {
            console.error("Failed to update post");
        }
    } catch (error) {
        console.error("Error updating post:", error);
    }

});

async function deletePost(postId) {
  try {
    const response = await fetch(`http://localhost:3000/delete/${postId}`, {
      method: "DELETE",
    });
    if (response.ok) {
        const responseData = await response.json();
        const deletedIndex = responseData.deletedIndex;
        console.log("Post deleted successfully at index:", deletedIndex);
        // Zaktualizuj indeksy pozostałych postów na stronie klienta
        updatePostIndexes(deletedIndex);
      console.log("Post deleted successfully");
      const postElement = document.querySelector(`li[data-post-id="${postId}"]`);
      if (postElement) {
        postElement.remove();
      } else {
        console.error("Post element not found");
      }
      // Tutaj możesz zaimplementować kod do odświeżania widoku postów na stronie klienta
    } else {
      console.error("Failed to delete post");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
  }

  if ($(".post-list > li").length === 0) {
        const noPostsContainer = $('<div class="post-list no-posts"><li>No posts loaded...</li></div>');
        $(".post-list").append(noPostsContainer);
    }
}

function updatePostIndexes(deletedIndex) {
  // Aktualizuj indeksy postów na stronie klienta
  const postElements = document.querySelectorAll('.post-list > li');
  postElements.forEach((element) => {
    const postId = parseInt(element.dataset.postId);
    if (postId > deletedIndex) {
      element.dataset.postId = postId - 1;
    }
  });
}