package com.ittest.service;

import com.ittest.pojo.Article;

import java.util.List;

public interface ArticleService {
    void add(Article article);

    List<Article> list(Integer categoryId);

    Article article(Integer articleId);

    void update(Article article);

    void delete(Integer id);
}
